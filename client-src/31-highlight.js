// Syntax tokenizer for chat code blocks.
//
// highlightCode(source, lang) returns plain { type, text } objects whose
// concatenated text is exactly `source`, so a renderer emits one text node per
// token. The scan is single-pass: at each position the earliest construct
// (comment, string, number, ...) is consumed and gaps stay plain. Nothing here
// builds HTML, evaluates input or touches the DOM.

const HIGHLIGHT_MAX_LENGTH = 400 * 1024
const HIGHLIGHT_MAX_REGEX = 1000
const CODE_OPERATORS = '+-*/%=!<>&|^~?:.,;()[]{}#@'
const CODE_REGEX_PREV_CHARS = '(,=:[!&|?{};'
const CODE_REGEX_WORDS = codeWordSet('return case throw typeof delete void new in of instanceof yield await do else')
const CODE_JSX_WORDS = codeWordSet('return case default else do yield await throw')
const CODE_YAML_CONSTANTS = codeWordSet('true false yes no on off null')
const CODE_NUMBER_RE = /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?)(?:(?:i|f|u)(?:8|16|32|64|128|size)|[uUlL]{1,3}|[fnjm])?/y
const CODE_IDENT_RE = /[\p{L}_$][\p{L}\p{N}_$]*/uy
const CODE_WORD_RE = /[\p{L}_$][\p{L}\p{N}_.$-]*/uy
const CODE_DECORATOR_RE = /@[\w$.]+/y
const CODE_AT_RULE_RE = /@[\w-]+/y
const CODE_CLI_FLAG_RE = /-{1,2}[A-Za-z][\w-]*/y
const CODE_CMDLET_RE = /[A-Za-z][A-Za-z0-9]*-[A-Za-z][A-Za-z0-9]+/y
const CODE_CSS_HASH_RE = /#[\w-]+/y
const CODE_CSS_CUSTOM_RE = /--[\w-]+/y
const CODE_ANCHOR_RE = /[&*!][^\s,[\]{}]*/y
const CODE_TAG_NAME_RE = /[A-Za-z][\w:.-]*/y
const CODE_ATTR_NAME_RE = /[^\s"'=<>`/{}\n]+/y
const CODE_MD_LINK_RE = /\[([^\]\n]{1,200})\]\(([^()\s]{1,500})\)/y

function codeWordSet(source) {
  return new Set(source.trim().split(/\s+/))
}

const javascriptDef = {
  keywords: codeWordSet(`break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return switch throw try typeof var void while with yield async await of static get set from as`),
  literals: codeWordSet('true false null undefined NaN Infinity'),
  types: codeWordSet('Array ArrayBuffer BigInt Boolean DataView Date Error Function Intl JSON Map Math Number Object Promise Proxy RangeError ReferenceError Reflect RegExp Set String Symbol SyntaxError TypeError URIError WeakMap WeakSet'),
  variables: codeWordSet('this super arguments'),
  lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"', "'", '`'],
  flags: { template: true, regex: true, jsx: true, stringKeys: true, keyColon: true, upperType: true, decorators: true },
}

const cppDef = {
  keywords: codeWordSet(`alignas alignof and and_eq asm auto bitand bitor bool break case catch char char8_t char16_t char32_t class compl concept const consteval constexpr constinit const_cast continue co_await co_return co_yield decltype default delete do double dynamic_cast else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept not not_eq nullptr operator or or_eq private protected public register reinterpret_cast requires return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typeid typename union unsigned using virtual void volatile wchar_t while xor xor_eq`),
  literals: codeWordSet('true false nullptr NULL'),
  types: codeWordSet('bool char char8_t char16_t char32_t double float int long short signed unsigned void wchar_t size_t ssize_t ptrdiff_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t string wstring vector map set unordered_map unordered_set pair unique_ptr shared_ptr weak_ptr optional variant'),
  lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"],
  prefixes: /(?:u8|u|U|L)/y,
  flags: { preprocessor: true, upperType: true, keyColon: true },
}

const CODE_LANG_DEFS = {
  javascript: javascriptDef,
  typescript: {
    ...javascriptDef,
    keywords: new Set([...javascriptDef.keywords, ...codeWordSet('abstract accessor asserts declare enum global implements infer interface intrinsic is keyof module namespace override private protected public readonly satisfies type unique using')]),
    types: new Set([...javascriptDef.types, ...codeWordSet('any bigint boolean never number object string symbol unknown void')]),
  },
  json: {
    keywords: codeWordSet('true false null'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'],
    flags: { stringKeys: true },
  },
  css: {
    keywords: codeWordSet('important inherit initial unset revert'),
    blockComments: [['/*', '*/']], strings: ['"', "'"],
    units: /(?:px|em|rem|ex|ch|vh|vw|vmin|vmax|fr|deg|rad|turn|s|ms|%)/y,
    flags: { keyColon: true, hashColor: true, cssCustom: true, atRule: true },
  },
  python: {
    keywords: codeWordSet('and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'),
    literals: codeWordSet('True False None Ellipsis NotImplemented'), types: codeWordSet('bool bytearray bytes complex dict float frozenset int list object range set str tuple type'), variables: codeWordSet('self cls'),
    lineComments: ['#'], strings: ['"', "'"], triple: ['"""', "'''"], prefixes: /[rRbBuUfF]{1,2}/y,
    flags: { stringKeys: true, keyColon: true, decorators: true, upperType: true },
  },
  bash: {
    keywords: codeWordSet('if then else elif fi for while until do done case esac function in select time coproc return exit break continue local export readonly declare unset shift source alias trap wait'),
    literals: codeWordSet('true false'),
    commands: codeWordSet('echo printf read cd pwd ls cp mv rm mkdir rmdir touch cat grep egrep sed awk find xargs sort uniq head tail cut tr wc chmod chown ps kill curl wget git npm pnpm node python python3 pip docker make sudo apt brew systemctl tar gzip unzip ssh scp'),
    lineComments: ['#'], strings: ['"', "'"],
    flags: { dollarVars: true, cliFlags: true, envVars: true },
  },
  powershell: {
    keywords: codeWordSet('begin break catch class continue data define do dynamicparam else elseif end enum exit filter finally for foreach from function hidden if in param process return static switch throw trap try until using var while workflow'),
    lineComments: ['#'], blockComments: [['<#', '#>']], strings: ['"', "'"], escape: '`',
    flags: { dollarVars: true, cliFlags: true, cmdlet: true, doubleEscaped: true },
  },
  sql: {
    keywords: codeWordSet('select from where insert into values update delete set create table alter drop index view join inner left right full outer on as and or not is like between exists in union all distinct group by order having limit offset top asc desc case when then else end begin commit rollback transaction grant revoke primary key foreign references unique check default constraint add column rename procedure function trigger return if while declare cursor fetch next'),
    literals: codeWordSet('true false null'),
    types: codeWordSet('bigint binary bit blob boolean char date datetime decimal double float int integer interval json money nchar numeric nvarchar real smallint text time timestamp tinyint uuid varchar varbinary'),
    lineComments: ['--'], blockComments: [['/*', '*/']], strings: ["'", '"'], escape: '',
    flags: { caseInsensitive: true, doubleEscaped: true },
  },
  java: {
    keywords: codeWordSet('abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package private protected public return static strictfp super switch synchronized this throw throws transient try volatile while var record sealed permits yield'),
    literals: codeWordSet('true false null'), types: codeWordSet('boolean byte char double float int long short void String Object Integer Long Double Float Boolean Character Byte Short List Map Set ArrayList HashMap HashSet Optional Stream'), variables: codeWordSet('this super'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"], triple: ['"""'],
    flags: { decorators: true, upperType: true },
  },
  csharp: {
    keywords: codeWordSet('abstract as base break case catch checked class const continue default delegate do else enum event explicit extern finally fixed for foreach goto if implicit in interface internal is lock namespace new operator out override params private protected public readonly ref return sealed sizeof stackalloc static struct switch this throw try typeof uint ulong unchecked unsafe ushort using virtual void volatile while add async await dynamic get global init partial record remove required set value var when where yield'),
    literals: codeWordSet('true false null'), types: codeWordSet('Boolean Byte Char DateTime Decimal Double Int16 Int32 Int64 Object SByte Single String UInt16 UInt32 UInt64 Void List Dictionary HashSet Task Guid Exception'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"], triple: ['"""'],
    prefixes: /(?:@\$|\$@|@|\$)/y,
    flags: { preprocessor: true, upperType: true },
  },
  cpp: cppDef,
  c: cppDef,
  go: {
    keywords: codeWordSet('break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var'),
    literals: codeWordSet('true false nil iota'),
    types: codeWordSet('bool byte complex64 complex128 error float32 float64 int int8 int16 int32 int64 rune string uint uint8 uint16 uint32 uint64 uintptr any comparable'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"],
    flags: { rawBacktick: true, upperType: true },
  },
  rust: {
    keywords: codeWordSet('as async await break const continue crate dyn else enum extern fn for if impl in let loop match mod move mut pub ref return static struct super trait type unsafe use where while yield'),
    literals: codeWordSet('true false'),
    types: codeWordSet('bool char f32 f64 i8 i16 i32 i64 i128 isize str u8 u16 u32 u64 u128 usize String Vec Option Result Box HashMap'), variables: codeWordSet('self Self super crate'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"],
    flags: { rustLifetimes: true, rustAttributes: true, upperType: true },
  },
  kotlin: {
    keywords: codeWordSet('as break class continue do else false for fun if in interface is null object package return super this throw true try typealias typeof val var when while by catch constructor delegate dynamic field file finally get import init param property receiver set setparam where actual abstract annotation companion const crossinline data enum expect external final infix inline inner internal lateinit noinline open operator out override private protected public reified sealed suspend tailrec vararg'),
    literals: codeWordSet('true false null'), types: codeWordSet('Any Boolean Byte Char Double Float Int Long Nothing Short String Unit Array List Map Set'), variables: codeWordSet('this super it'),
    lineComments: ['//'], blockComments: [['/*', '*/']], strings: ['"'], chars: ["'"], triple: ['"""'],
    flags: { decorators: true, upperType: true },
  },
  yaml: { scanner: 'yaml' },
  markup: { scanner: 'markup' },
  markdown: { scanner: 'markdown' },
  diff: { scanner: 'diff' },
  text: { plain: true },
  // Diagram fences are detected by the markdown parser; leave their source as is.
  mermaid: { plain: true },
}

const CODE_LANG_ALIASES = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript', ts: 'typescript', tsx: 'typescript', mts: 'typescript', cts: 'typescript',
  py: 'python', python3: 'python', sh: 'bash', shell: 'bash', zsh: 'bash', ps1: 'powershell', pwsh: 'powershell', yml: 'yaml',
  c: 'c', h: 'c', 'c++': 'cpp', cc: 'cpp', hpp: 'cpp', hxx: 'cpp', cs: 'csharp', 'c#': 'csharp', rs: 'rust', golang: 'go', kt: 'kotlin', kts: 'kotlin',
  html: 'markup', htm: 'markup', xml: 'markup', svg: 'markup', vue: 'markup', svelte: 'markup', xhtml: 'markup', jsonc: 'json', json5: 'json', md: 'markdown',
  patch: 'diff', txt: 'text', plain: 'text', plaintext: 'text', none: 'text',
}

/** Canonical language id for a fence info string; unknown languages become 'text'. */
function normalizeCodeLang(lang) {
  if (typeof lang !== 'string') return 'text'
  let id = lang.trim().toLowerCase()
  if (id.startsWith('language-')) id = id.slice('language-'.length)
  id = id.split(/[\s,;]+/)[0] || ''
  id = id.replace(/^[`~{.\[]+/, '').replace(/[`~}\]]+$/, '')
  if (id === '') return 'text'
  if (Object.prototype.hasOwnProperty.call(CODE_LANG_ALIASES, id)) return CODE_LANG_ALIASES[id]
  return Object.prototype.hasOwnProperty.call(CODE_LANG_DEFS, id) ? id : 'text'
}

function codeEndOfLine(source, index) {
  const next = source.indexOf('\n', index)
  return next === -1 ? source.length : next
}

function codeOnlyWhitespace(source, start, end) {
  return !/[^ \t\r]/.test(source.slice(start, end))
}

function codeNextIndex(source, index) {
  while (index < source.length && /\s/.test(source[index])) index += 1
  return index
}

function codeIsKeyString(source, index) {
  const next = codeNextIndex(source, index)
  return source[next] === ':' && source[next + 1] !== ':'
}

function codeIsDigit(ch) {
  return ch >= '0' && ch <= '9'
}

/** Shared sink: turns (type, start, end) spans into ordered tokens with gaps as plain text. */
function codeTokenSink(source, tokens) {
  let plainStart = 0
  const push = (type, start, end) => {
    if (end <= start) return
    if (start > plainStart) tokens.push({ type: '', text: source.slice(plainStart, start) })
    tokens.push({ type, text: source.slice(start, end) })
    plainStart = end
  }
  const finish = () => {
    if (plainStart < source.length) tokens.push({ type: '', text: source.slice(plainStart) })
    return tokens
  }
  return { push, finish }
}

/** Scan a quoted run from its opening delimiter; unterminated runs stop at EOL/EOF. */
function readCodeQuoted(source, start, quote, options) {
  const escape = options.escape === undefined ? '\\' : options.escape
  let index = start + quote.length
  while (index < source.length) {
    const ch = source[index]
    if (escape !== '' && ch === escape) { index += 2; continue }
    if (options.double && ch === quote[0] && source[index + 1] === quote[0]) { index += 2; continue }
    if (quote.length === 1 && ch === '\n' && !options.multiline) return index
    if (source.startsWith(quote, index)) return index + quote.length
    index += 1
  }
  return index
}

/** Skip a `${...}` expression inside a template literal. */
function scanTemplateExpression(source, start) {
  let index = start
  let depth = 1
  while (index < source.length) {
    const ch = source[index]
    if (ch === '\\') index += 2
    else if (ch === "'" || ch === '"') index = readCodeQuoted(source, index, ch, { multiline: false })
    else if (ch === '`') index = scanTemplateLiteral(source, index)
    else if (ch === '{') { depth += 1; index += 1 } else if (ch === '}') {
      depth -= 1
      if (depth === 0) return index + 1
      index += 1
    } else index += 1
  }
  return index
}

function scanTemplateLiteral(source, start) {
  let index = start + 1
  while (index < source.length) {
    const ch = source[index]
    if (ch === '\\') index += 2
    else if (ch === '`') return index + 1
    else if (ch === '$' && source[index + 1] === '{') index = scanTemplateExpression(source, index + 2)
    else index += 1
  }
  return index
}

/** Detect a string/char/template at `index`; returns { type, end } or null. */
function readCodeString(source, index, def) {
  const flags = def.flags || {}
  let quoteStart = index
  let prefix = ''
  if (def.prefixes !== undefined) {
    def.prefixes.lastIndex = index
    const match = def.prefixes.exec(source)
    const after = index + (match === null ? 0 : match[0].length)
    const triple = def.triple !== undefined && def.triple.some(quote => source.startsWith(quote, after))
    if (match !== null && match.index === index && (triple || (def.strings !== undefined && def.strings.includes(source[after])))) {
      prefix = match[0]
      quoteStart = after
    }
  }
  const ch = source[quoteStart]
  if (ch === undefined) return null
  if (flags.rustLifetimes && ch === "'" && prefix === '') {
    const lifetime = /^'[A-Za-z_][A-Za-z0-9_]*/y
    lifetime.lastIndex = quoteStart
    const match = lifetime.exec(source)
    if (match !== null && source[quoteStart + match[0].length] !== "'") return { type: 'var', end: quoteStart + match[0].length }
  }
  if (def.triple !== undefined) {
    for (const quote of def.triple) {
      if (source.startsWith(quote, quoteStart)) {
        return { type: 'str', end: readCodeQuoted(source, quoteStart, quote, { multiline: true, escape: def.escape === undefined ? '\\' : def.escape }) }
      }
    }
  }
  if (flags.template && ch === '`') return { type: 'str', end: scanTemplateLiteral(source, quoteStart) }
  if (flags.rawBacktick && ch === '`') {
    const close = source.indexOf('`', quoteStart + 1)
    return { type: 'str', end: close === -1 ? source.length : close + 1 }
  }
  const quoted = def.strings !== undefined && def.strings.includes(ch)
  const character = def.chars !== undefined && def.chars.includes(ch)
  if (!quoted && !character) return null
  const verbatim = prefix.includes('@')
  return {
    type: 'str',
    end: readCodeQuoted(source, quoteStart, ch, {
      multiline: false,
      escape: verbatim ? '' : (def.escape === undefined ? '\\' : def.escape),
      double: verbatim || Boolean(flags.doubleEscaped),
    }),
  }
}

function readCodeComment(source, index, def) {
  for (const marker of def.lineComments || []) {
    if (source.startsWith(marker, index)) return codeEndOfLine(source, index)
  }
  for (const pair of def.blockComments || []) {
    if (source.startsWith(pair[0], index)) {
      const close = source.indexOf(pair[1], index + pair[0].length)
      return close === -1 ? source.length : close + pair[1].length
    }
  }
  return -1
}

/** Conservative JS regex literal reader: returns -1 when this cannot be a regex. */
function readCodeRegex(source, start) {
  let index = start + 1
  let inClass = false
  while (index < source.length) {
    const ch = source[index]
    if (ch === '\n') return -1
    if (ch === '\\') index += 2
    else {
      if (ch === '[') inClass = true
      else if (ch === ']') inClass = false
      else if (ch === '/' && !inClass) {
        index += 1
        while (index < source.length && /[a-z]/i.test(source[index])) index += 1
        return index
      }
      index += 1
    }
    if (index - start > HIGHLIGHT_MAX_REGEX) return -1
  }
  return -1
}

function readRustAttribute(source, index) {
  let cursor = index + 1
  if (source[cursor] === '!') cursor += 1
  if (source[cursor] !== '[') return -1
  let depth = 0
  while (cursor < source.length) {
    const ch = source[cursor]
    if (ch === '[') depth += 1
    else if (ch === ']') {
      depth -= 1
      if (depth === 0) return cursor + 1
    } else if (ch === '"' || ch === "'") {
      cursor = readCodeQuoted(source, cursor, ch, { multiline: false })
      continue
    }
    cursor += 1
  }
  return source.length
}

/** Read one JSX-ish tag; parts is null when the `<` is a comparison instead. */
function readJsxTag(source, start) {
  let index = start + 1
  const closing = source[index] === '/'
  if (closing) index += 1
  CODE_TAG_NAME_RE.lastIndex = index
  const name = CODE_TAG_NAME_RE.exec(source)
  if (name === null || name.index !== index) return { parts: null, end: start + 1 }
  const parts = [['op', start, start + 1]]
  if (closing) parts.push(['op', start + 1, index])
  parts.push(['tag', index, index + name[0].length])
  index += name[0].length
  let newlines = 0
  while (index < source.length) {
    const ch = source[index]
    if (ch === '\n' && (newlines += 1) > 12) return { parts: null, end: index }
    if (ch === '>') { parts.push(['op', index, index + 1]); return { parts, end: index + 1 } }
    if (ch === '/' && source[index + 1] === '>') { parts.push(['op', index, index + 2]); return { parts, end: index + 2 } }
    if (/\s|=/.test(ch)) { index += 1; continue }
    if (ch === '"' || ch === "'") {
      const end = readCodeQuoted(source, index, ch, { multiline: false })
      parts.push(['str', index, end])
      index = end
      continue
    }
    if (ch === '{') {
      let depth = 0
      while (index < source.length) {
        const inner = source[index]
        if (inner === '"' || inner === "'") { index = readCodeQuoted(source, index, inner, { multiline: false }); continue }
        if (inner === '{') depth += 1
        else if (inner === '}') {
          depth -= 1
          if (depth === 0) { index += 1; break }
        }
        index += 1
      }
      continue
    }
    CODE_ATTR_NAME_RE.lastIndex = index
    const attribute = CODE_ATTR_NAME_RE.exec(source)
    if (attribute === null || attribute.index !== index) { index += 1; continue }
    parts.push(['attr', index, index + attribute[0].length])
    index += attribute[0].length
  }
  return { parts: null, end: source.length }
}

function classifyCodeWord(word, source, end, def, prevChar) {
  const flags = def.flags || {}
  const lookup = flags.caseInsensitive ? word.toLowerCase() : word
  if (def.types !== undefined && def.types.has(lookup)) return 'type'
  if (def.literals !== undefined && def.literals.has(lookup)) return 'num'
  if (def.keywords !== undefined && def.keywords.has(lookup)) return 'kw'
  if (def.variables !== undefined && def.variables.has(word)) return 'var'
  if (def.commands !== undefined && def.commands.has(lookup)) return 'fn'
  if (prevChar === '.') return 'attr'
  const next = codeNextIndex(source, end)
  const nextChar = source[next] || ''
  if (nextChar === '(') return 'fn'
  if (nextChar === ':' && source[next + 1] !== ':' && flags.keyColon) return 'attr'
  if (flags.envVars && nextChar === '=' && /^[A-Z_][A-Z0-9_]*$/.test(word)) return 'var'
  if (flags.upperType && /^[A-Z][a-z]/.test(word)) return 'type'
  return word[0] === '$' ? 'var' : ''
}

/** Shared scanner for the brace-and-semicolon style languages. */
function scanGeneric(source, def) {
  const tokens = []
  const length = source.length
  const flags = def.flags || {}
  const sink = codeTokenSink(source, tokens)
  const push = sink.push
  let index = 0
  let lineStart = 0
  let jsxResume = 0
  let prevChar = ''
  let prevWord = ''
  let prevToken = ''
  const emit = (type, end, token) => {
    push(type, index, end)
    prevChar = source[end - 1] || ''
    prevWord = ''
    prevToken = token || ''
    index = end
  }

  while (index < length) {
    const ch = source[index]
    if (ch === '\n') { index += 1; lineStart = index; continue }
    if (ch === ' ' || ch === '\t' || ch === '\r') { index += 1; continue }

    // Whole-line meta constructs.
    if (ch === '#' && index === 0 && source[1] === '!') { emit('meta', codeEndOfLine(source, index), 'meta'); continue }
    if (flags.preprocessor && ch === '#' && codeOnlyWhitespace(source, lineStart, index)) {
      emit('meta', codeEndOfLine(source, index), 'meta')
      continue
    }
    if (flags.rustAttributes && ch === '#') {
      const end = readRustAttribute(source, index)
      if (end > index) { emit('meta', end, 'meta'); continue }
    }

    const comment = readCodeComment(source, index, def)
    if (comment !== -1) { push('com', index, comment); index = comment; continue }

    const string = readCodeString(source, index, def)
    if (string !== null) {
      emit(flags.stringKeys && codeIsKeyString(source, string.end) ? 'attr' : string.type, string.end, 'string')
      continue
    }

    if (codeIsDigit(ch) || (ch === '.' && codeIsDigit(source[index + 1]))) {
      CODE_NUMBER_RE.lastIndex = index
      const number = CODE_NUMBER_RE.exec(source)
      if (number !== null && number.index === index) {
        let end = index + number[0].length
        if (def.units !== undefined) {
          def.units.lastIndex = end
          const unit = def.units.exec(source)
          if (unit !== null && unit.index === end) end += unit[0].length
        }
        emit('num', end, 'number')
        continue
      }
    }

    if (flags.dollarVars && ch === '$') {
      let end = index + 1
      if (source[end] === '{') {
        end += 1
        let depth = 1
        while (end < length) {
          if (source[end] === '{') depth += 1
          else if (source[end] === '}') {
            depth -= 1
            if (depth === 0) { end += 1; break }
          }
          end += 1
        }
      } else {
        while (end < length && /[\w:?$#@*!-]/.test(source[end])) end += 1
      }
      emit('var', end, 'variable')
      continue
    }

    if (ch === '@' && (flags.decorators || flags.atRule)) {
      const pattern = flags.atRule ? CODE_AT_RULE_RE : CODE_DECORATOR_RE
      pattern.lastIndex = index
      const match = pattern.exec(source)
      if (match !== null && match.index === index) { emit('meta', index + match[0].length, 'meta'); continue }
    }

    if (flags.cliFlags && ch === '-' && /[A-Za-z]/.test(source[index + 1] || '')
      && (index === 0 || /[\s([{|&;]/.test(source[index - 1]))) {
      CODE_CLI_FLAG_RE.lastIndex = index
      const flag = CODE_CLI_FLAG_RE.exec(source)
      if (flag !== null && flag.index === index) { emit('attr', index + flag[0].length, 'flag'); continue }
    }

    if (flags.cssCustom && ch === '-' && source[index + 1] === '-') {
      CODE_CSS_CUSTOM_RE.lastIndex = index
      const custom = CODE_CSS_CUSTOM_RE.exec(source)
      if (custom !== null && custom.index === index) { emit('var', index + custom[0].length, 'variable'); continue }
    }

    if (flags.hashColor && ch === '#') {
      CODE_CSS_HASH_RE.lastIndex = index
      const hash = CODE_CSS_HASH_RE.exec(source)
      if (hash !== null && hash.index === index) {
        emit(/^#[\da-fA-F]{3,8}$/.test(hash[0]) ? 'num' : 'var', index + hash[0].length, 'hash')
        continue
      }
    }

    if (flags.jsx && ch === '<' && index >= jsxResume) {
      const allowed = prevToken === '=>' || CODE_JSX_WORDS.has(prevWord)
        || CODE_REGEX_PREV_CHARS.includes(prevChar) || prevChar === ''
      if (allowed) {
        const tag = readJsxTag(source, index)
        if (tag.parts !== null) {
          for (const part of tag.parts) push(part[0], part[1], part[2])
          prevChar = '>'
          prevWord = ''
          prevToken = '>'
          index = tag.end
          continue
        }
        // A failed tag scan consumed this region without a tag; do not retry
        // inside it, which would make malformed JSX quadratic.
        jsxResume = tag.end
      }
    }

    if (ch === '/' && flags.regex) {
      const allowed = prevChar === '' || prevToken === '=>'
        || CODE_REGEX_WORDS.has(prevWord) || CODE_REGEX_PREV_CHARS.includes(prevChar)
      if (allowed) {
        const end = readCodeRegex(source, index)
        if (end !== -1) { emit('str', end, 'regex'); continue }
      }
    }

    if (flags.cmdlet) {
      CODE_CMDLET_RE.lastIndex = index
      const cmdlet = CODE_CMDLET_RE.exec(source)
      if (cmdlet !== null && cmdlet.index === index && /[\s(]/.test(source[index + cmdlet[0].length] || ' ')) {
        emit('fn', index + cmdlet[0].length, 'cmdlet')
        continue
      }
    }

    CODE_IDENT_RE.lastIndex = index
    const ident = CODE_IDENT_RE.exec(source)
    if (ident !== null && ident.index === index) {
      const word = ident[0]
      const end = index + word.length
      const type = classifyCodeWord(word, source, end, def, prevChar)
      if (type !== '') push(type, index, end)
      prevChar = word[word.length - 1]
      prevWord = flags.caseInsensitive ? word.toLowerCase() : word
      prevToken = word
      index = end
      continue
    }

    if (CODE_OPERATORS.includes(ch)) {
      let end = index + 1
      while (end < length && CODE_OPERATORS.includes(source[end])) end += 1
      emit('op', end, source.slice(index, end))
      continue
    }
    index += 1
  }
  return sink.finish()
}

function scanMarkup(source) {
  const tokens = []
  const length = source.length
  const { push, finish } = codeTokenSink(source, tokens)
  let index = 0

  while (index < length) {
    if (source[index] !== '<') { index += 1; continue }
    let type = ''
    let end = -1
    if (source.startsWith('<!--', index)) {
      const close = source.indexOf('-->', index + 4)
      type = 'com'
      end = close === -1 ? length : close + 3
    } else if (source.startsWith('<![CDATA[', index)) {
      const close = source.indexOf(']]>', index + 9)
      type = 'meta'
      end = close === -1 ? length : close + 3
    } else if (source.startsWith('<!', index) || source.startsWith('<?', index)) {
      const close = source.indexOf('>', index + 2)
      type = 'meta'
      end = close === -1 ? length : close + 1
    }
    if (type !== '') { push(type, index, end); index = end; continue }

    let cursor = index + 1
    const closing = source[cursor] === '/'
    if (closing) cursor += 1
    CODE_TAG_NAME_RE.lastIndex = cursor
    const name = CODE_TAG_NAME_RE.exec(source)
    if (name === null || name.index !== cursor) { index += 1; continue }
    push('op', index, index + 1)
    if (closing) push('op', index + 1, cursor)
    const nameEnd = cursor + name[0].length
    push('tag', cursor, nameEnd)
    let attrs = nameEnd
    while (attrs < length) {
      const ch = source[attrs]
      if (ch === '>') { push('op', attrs, attrs + 1); attrs += 1; break }
      if (ch === '/' && source[attrs + 1] === '>') { push('op', attrs, attrs + 2); attrs += 2; break }
      if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') { attrs += 1; continue }
      if (ch === '=') {
        push('op', attrs, attrs + 1)
        attrs += 1
        while (attrs < length && /\s/.test(source[attrs])) attrs += 1
        if (source[attrs] === '"' || source[attrs] === "'") {
          const valueEnd = readCodeQuoted(source, attrs, source[attrs], { multiline: false })
          push('str', attrs, valueEnd)
          attrs = valueEnd
          continue
        }
        let valueEnd = attrs
        while (valueEnd < length && !/[\s>]/.test(source[valueEnd])
          && !(source[valueEnd] === '/' && source[valueEnd + 1] === '>')) valueEnd += 1
        if (valueEnd > attrs) push('str', attrs, valueEnd)
        attrs = valueEnd
        continue
      }
      if (ch === '"' || ch === "'") {
        const valueEnd = readCodeQuoted(source, attrs, ch, { multiline: false })
        push('str', attrs, valueEnd)
        attrs = valueEnd
        continue
      }
      if (ch === '{') {
        let depth = 0
        while (attrs < length) {
          const inner = source[attrs]
          if (inner === '"' || inner === "'") { attrs = readCodeQuoted(source, attrs, inner, { multiline: false }); continue }
          if (inner === '{') depth += 1
          else if (inner === '}') {
            depth -= 1
            if (depth === 0) { attrs += 1; break }
          }
          attrs += 1
        }
        continue
      }
      CODE_ATTR_NAME_RE.lastIndex = attrs
      const attribute = CODE_ATTR_NAME_RE.exec(source)
      if (attribute !== null && attribute.index === attrs) {
        push('attr', attrs, attrs + attribute[0].length)
        attrs += attribute[0].length
        continue
      }
      attrs += 1
    }
    index = attrs
  }
  return finish()
}

function scanYamlInline(source, start, end, push) {
  let index = start
  while (index < end) {
    const ch = source[index]
    if (ch === ' ' || ch === '\t') { index += 1; continue }
    if (ch === '#') { push('com', index, end); return }
    if (ch === '"' || ch === "'") {
      const close = Math.min(readCodeQuoted(source, index, ch, { multiline: false, double: ch === "'" }), end)
      push('str', index, close)
      index = close
      continue
    }
    if (ch === '&' || ch === '*' || ch === '!') {
      CODE_ANCHOR_RE.lastIndex = index
      const anchor = CODE_ANCHOR_RE.exec(source)
      if (anchor !== null && anchor.index === index && index + anchor[0].length <= end) {
        push('meta', index, index + anchor[0].length)
        index += anchor[0].length
        continue
      }
    }
    if (ch === '~') { push('num', index, index + 1); index += 1; continue }
    if ('[]{},:?'.includes(ch) || (ch === '-' && source[index + 1] === ' ')) {
      push('op', index, index + 1)
      index += 1
      continue
    }
    if (codeIsDigit(ch) || (ch === '.' && codeIsDigit(source[index + 1]))) {
      CODE_NUMBER_RE.lastIndex = index
      const number = CODE_NUMBER_RE.exec(source)
      if (number !== null && number.index === index && number[0] !== '') {
        const numberEnd = index + number[0].length
        if (!/[A-Za-z_$]/.test(source[numberEnd] || '')) { push('num', index, numberEnd); index = numberEnd; continue }
      }
    }
    CODE_WORD_RE.lastIndex = index
    const word = CODE_WORD_RE.exec(source)
    if (word !== null && word.index === index) {
      const wordEnd = index + word[0].length
      if (CODE_YAML_CONSTANTS.has(word[0].toLowerCase()) && (wordEnd === end || /[\s,\]}]]/.test(source[wordEnd] || ''))) {
        push('num', index, wordEnd)
      }
      index = wordEnd
      continue
    }
    index += 1
  }
}

function scanYaml(source) {
  const tokens = []
  const length = source.length
  const { push, finish } = codeTokenSink(source, tokens)
  let index = 0
  let blockIndent = -1

  while (index < length) {
    const lineEnd = codeEndOfLine(source, index)
    const line = source.slice(index, lineEnd)
    if (line.trim() === '') { index = lineEnd + 1; continue }
    const indent = /^[ \t]*/.exec(line)[0].length
    if (blockIndent >= 0) {
      if (indent > blockIndent) { index = lineEnd + 1; continue }
      blockIndent = -1
    }
    if (/^(?:---|\.\.\.)\s*$/.test(line)) { push('meta', index, lineEnd); index = lineEnd + 1; continue }
    let cursor = index
    const list = /^([ \t]*)(-[ \t]+)/.exec(line)
    if (list !== null) {
      const dashStart = index + list[1].length
      push('op', dashStart, dashStart + 1)
      cursor = index + list[0].length
    }
    const key = /^([^\s:#][^:\n]*?):(?=[ \t]|$)/.exec(source.slice(cursor, lineEnd))
    if (key !== null) {
      const keyEnd = cursor + key[1].length
      push('attr', cursor, keyEnd)
      push('op', keyEnd, keyEnd + 1)
      cursor = keyEnd + 1
    }
    scanYamlInline(source, cursor, lineEnd, push)
    if (/[|>][-+]?\s*(?:#.*)?$/.test(source.slice(cursor, lineEnd).trim())) blockIndent = indent
    index = lineEnd + 1
  }
  return finish()
}

function scanMarkdownInline(source, start, end, push) {
  let index = start
  while (index < end) {
    const ch = source[index]
    if (ch === '`') {
      const close = source.indexOf('`', index + 1)
      if (close !== -1 && close < end) { push('str', index, close + 1); index = close + 1 } else index += 1
    } else if (ch === '[') {
      CODE_MD_LINK_RE.lastIndex = index
      const link = CODE_MD_LINK_RE.exec(source)
      if (link !== null && link.index === index && index + link[0].length <= end) {
        const labelEnd = index + 1 + link[1].length
        push('op', index, index + 1)
        push('op', labelEnd, labelEnd + 2)
        const urlEnd = labelEnd + 2 + link[2].length
        push('str', labelEnd + 2, urlEnd)
        push('op', urlEnd, urlEnd + 1)
        index += link[0].length
      } else index += 1
    } else if (ch === '*' || ch === '_' || ch === '~') {
      let next = index + 1
      while (next < end && source[next] === ch) next += 1
      if (next - index <= 3) { push('op', index, next); index = next } else index += 1
    } else index += 1
  }
}

function scanMarkdown(source) {
  const tokens = []
  const length = source.length
  const { push, finish } = codeTokenSink(source, tokens)
  let index = 0
  let fence = ''

  while (index < length) {
    const lineEnd = codeEndOfLine(source, index)
    const line = source.slice(index, lineEnd)
    const fenceMatch = /^([ \t]*)(```+|~~~+)/.exec(line)
    const heading = /^([ \t]{0,3})(#{1,6})([ \t]+)/.exec(line)
    const quote = /^([ \t]*)(>)[ \t]?/.exec(line)
    const list = /^([ \t]*)([-*+]|\d+[.)])([ \t]+)/.exec(line)
    if (fence !== '') {
      if (fenceMatch !== null && fenceMatch[2][0] === fence[0] && fenceMatch[2].length >= fence.length) {
        push('meta', index + fenceMatch[1].length, lineEnd)
        fence = ''
      }
      index = lineEnd + 1
      continue
    }
    if (fenceMatch !== null) {
      push('meta', index + fenceMatch[1].length, lineEnd)
      fence = fenceMatch[2]
    } else if (/^[ \t]{0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})$/.test(line)) {
      push('meta', index, lineEnd)
    } else if (heading !== null) {
      const markerStart = index + heading[1].length
      push('meta', markerStart, markerStart + heading[2].length)
      scanMarkdownInline(source, index + heading[0].length, lineEnd, push)
    } else if (quote !== null) {
      const markerStart = index + quote[1].length
      push('op', markerStart, markerStart + 1)
      scanMarkdownInline(source, index + quote[0].length, lineEnd, push)
    } else if (list !== null) {
      const markerStart = index + list[1].length
      push('op', markerStart, markerStart + list[2].length)
      scanMarkdownInline(source, index + list[0].length, lineEnd, push)
    } else scanMarkdownInline(source, index, lineEnd, push)
    index = lineEnd + 1
  }
  return finish()
}

function scanDiff(source) {
  const tokens = []
  const length = source.length
  const { push, finish } = codeTokenSink(source, tokens)
  let index = 0
  while (index < length) {
    const lineEnd = codeEndOfLine(source, index)
    const line = source.slice(index, lineEnd)
    if (line !== '' && (/^(?:diff |index |\+\+\+|---|@@|new file|deleted file|similarity |rename )/.test(line) || /^[+-]/.test(line))) {
      push('meta', index, lineEnd)
    }
    index = lineEnd + 1
  }
  return finish()
}

/** Tokenize `code` for a language id or alias. Never throws. */
function highlightCode(code, lang) {
  const source = typeof code === 'string' ? code : String(code ?? '')
  const id = normalizeCodeLang(lang)
  if (id === 'text') return [{ type: '', text: source }]
  const def = CODE_LANG_DEFS[id]
  if (def === undefined || def.plain === true) return [{ type: '', text: source }]
  try {
    const limit = Math.min(source.length, HIGHLIGHT_MAX_LENGTH)
    const head = limit === source.length ? source : source.slice(0, limit)
    let tokens
    if (def.scanner === 'markup') tokens = scanMarkup(head)
    else if (def.scanner === 'yaml') tokens = scanYaml(head)
    else if (def.scanner === 'markdown') tokens = scanMarkdown(head)
    else if (def.scanner === 'diff') tokens = scanDiff(head)
    else tokens = scanGeneric(head, def)
    if (limit < source.length) tokens.push({ type: '', text: source.slice(limit) })
    return tokens
  } catch {
    return [{ type: '', text: source }]
  }
}

/** Same tokens as highlightCode, split into rows at newlines for diff-style UI. */
function highlightLines(code, lang) {
  const source = typeof code === 'string' ? code : String(code ?? '')
  const rows = [[]]
  let row = rows[0]
  for (const token of highlightCode(source, lang)) {
    const parts = token.text.split('\n')
    for (let index = 0; index < parts.length; index += 1) {
      if (index > 0) { row = []; rows.push(row) }
      if (parts[index] !== '') row.push({ type: token.type, text: parts[index] })
    }
  }
  return rows
}
