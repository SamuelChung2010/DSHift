/**
 * Pure text helpers for long-term memory: normalization, fingerprints, a small
 * lexical similarity used for de-duplication, category inference, and the
 * sensitive-information check that keeps automatic extraction away from
 * personal data. Nothing here touches disk, the network or a model, so every
 * rule is directly testable.
 */

/** Hard cap for one stored memory, in characters. */
export const MAX_MEMORY_CHARS = 600

/** Stored categories, in display order. */
export const MEMORY_CATEGORY_IDS = Object.freeze(['instruction', 'identity', 'career', 'projects', 'preferences'])

const CATEGORY_ALIASES = Object.freeze({
  instruction: 'instruction',
  instructions: 'instruction',
  指令: 'instruction',
  指示: 'instruction',
  identity: 'identity',
  身份: 'identity',
  profile: 'identity',
  career: 'career',
  职业: 'career',
  work: 'career',
  project: 'projects',
  projects: 'projects',
  项目: 'projects',
  preference: 'preferences',
  preferences: 'preferences',
  偏好: 'preferences',
  preference_style: 'preferences',
})

/** Unknown or absent input returns undefined, never a guess. */
export function normalizeMemoryCategory(value) {
  if (typeof value !== 'string') return undefined
  return CATEGORY_ALIASES[value.trim().toLowerCase()]
}

/**
 * One display-safe memory line: whitespace collapsed, list and date markers
 * stripped, empty input rejected. The result is what the model sees and what
 * the user edits, so it must never carry the export scaffolding.
 * @param value - raw content from a user, a model reply or an import.
 * @param limit - maximum length after normalization.
 */
export function normalizeMemoryContent(value, limit = MAX_MEMORY_CHARS) {
  if (typeof value !== 'string') return ''
  let text = value.replace(/\r\n?/g, '\n')
  text = text.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ')
  text = text.replace(/\s+/g, ' ').trim()
  // `[2024-01-02] - memory` and `[unknown] - memory` are export decorations.
  text = text.replace(/^\[(?:\d{4}-\d{2}-\d{2}|unknown|未知)\]\s*[-–—:]?\s*/i, '')
  text = text.replace(/^(?:[-*•·]\s+|\d+[.)、]\s*)/, '')
  text = text.replace(/^[`"'“”‘’]+|[`"'“”‘’]+$/g, '').trim()
  return text.slice(0, Math.max(1, limit))
}

/** Comparison key: case, punctuation and spacing differences are not distinct. */
export function memoryContentKey(content) {
  return normalizeMemoryContent(content)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

/**
 * Tokens for lexical matching. Latin words stay whole; Chinese runs become
 * character bigrams so no dictionary or segmentation dependency is needed.
 */
export function memoryTokens(content) {
  const value = normalizeMemoryContent(content).toLowerCase()
  const tokens = new Set()
  for (const word of value.match(/[a-z0-9][a-z0-9._+#-]{0,}/g) ?? []) {
    if (word.length >= 2) tokens.add(word)
  }
  for (const run of value.match(/[\u3400-\u9fff]+/g) ?? []) {
    if (run.length === 1) tokens.add(run)
    else for (let index = 0; index + 1 < run.length; index += 1) tokens.add(run.slice(index, index + 2))
  }
  return tokens
}

/** Whether a sentence carries a negation marker, used to avoid merging opposites. */
function hasNegation(text) {
  return /(?:不|没|别|无|never|not|no longer|don't|doesn't|isn't|won't)/i.test(text)
}

function numbersIn(text) {
  return (String(text).match(/\d+(?:\.\d+)?/g) ?? []).slice(0, 6).sort()
}

/**
 * Similarity for de-duplication, in 0..1. Chinese has no word boundaries here,
 * so bigram coverage of the shorter text is the main signal: one fact stated
 * with extra details still covers the original wording. A jaccard term keeps
 * unrelated long sentences apart, and negation/number mismatches are clamped
 * so "likes X" and "does not like X" never merge.
 */
export function memorySimilarity(left, right) {
  const a = memoryTokens(left)
  const b = memoryTokens(right)
  if (a.size === 0 || b.size === 0) return 0
  let shared = 0
  for (const token of a) if (b.has(token)) shared += 1
  const coverage = shared / Math.min(a.size, b.size)
  const jaccard = shared / (a.size + b.size - shared)
  let score = coverage * 0.75 + jaccard * 0.25
  if (hasNegation(left) !== hasNegation(right)) score = Math.min(score, 0.5)
  const leftNumbers = numbersIn(left)
  const rightNumbers = numbersIn(right)
  if (leftNumbers.length > 0 && rightNumbers.length > 0 && leftNumbers.join() !== rightNumbers.join()) {
    score = Math.min(score, 0.6)
  }
  return Math.max(0, Math.min(1, Math.round(score * 1000) / 1000))
}

/**
 * Category inferred from wording alone, used when an import or a model reply
 * omits one. The order matters: an explicit answer-style instruction is not
 * just another preference.
 */
export function inferMemoryCategory(content) {
  const text = normalizeMemoryContent(content)
  if (text === '') return 'preferences'
  if (/^(?:以后|今后|从今|回答|回复|解释|请|不要|别|每次|始终|总是|永远)|回答(?:时|请|要|用)|回复(?:时|请|要|用)|(?:用|使用)(?:中文|英文|english|chinese)|(?:简洁|详细|简短|具体)的?(?:回答|回复|解释)|(?:format|answer|reply|respond).{0,24}(?:concise|brief|detailed|chinese|english)|always|never|from now on/i.test(text)) {
    return 'instruction'
  }
  if (/(?:我叫|我的名字|我的生日|出生于|住在|居住|现居|来自|国籍|学生|高中生|大学生|在.{1,24}(?:学校|中学|高中|大学|学院)|my name|i am|i'm|live in|born|student|school|university)/i.test(text)) {
    return 'identity'
  }
  if (/(?:工作|职业|职位|岗位|公司|实习|工程师|设计师|经理|创业|自由职业|job|career|worked at|working at|role|intern|engineer|designer|founder)/i.test(text)) {
    return 'career'
  }
  if (/(?:项目|插件|仓库|开发|应用|网站|游戏|模组|技术栈|架构|project|plugin|repository|repo|building|developing|codebase|website|game|stack)/i.test(text)) {
    return 'projects'
  }
  if (/(?:喜欢|讨厌|偏好|习惯|爱好|兴趣|prefer|like|love|hate|dislike|favorite|habit|interest)/i.test(text)) {
    return 'preferences'
  }
  return 'preferences'
}

const SENSITIVE_PATTERNS = [
  /[\w.+-]+@[\w-]+\.[\w.]+/,
  /(?<!\d)1[3-9]\d{9}(?!\d)/,
  /(?<!\d)\d{17}[\dXx](?!\d)/,
  /(?<!\d)(?:\d[ -]?){15,19}(?!\d)/,
  /\+\d{1,3}[\s-]?\d{6,14}/,
  /(?:密码|口令|身份证|银行卡|信用卡|银行账号|家庭住址|详细地址|护照号|api[\s_-]?key|password|passcode|social security|ssn|bank account|credit card|home address|passport number)/i,
]

/**
 * Whether content looks like personal data that automatic extraction must not
 * save. Manual entries and explicit imports are the user's own decision; this
 * gate only stops the assistant from volunteering such facts.
 */
export function looksSensitive(value) {
  const text = typeof value === 'string' ? value : ''
  if (text.trim() === '') return false
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(text))
}
