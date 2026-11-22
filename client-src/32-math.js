// 32-math.js — dependency-free LaTeX math renderer for chat answers.
//
// Concatenated into the plugin bundle, so: no imports or exports and no
// top-level side effects. Output is React elements only; source text is passed
// as children, never as HTML, so model output cannot inject markup.
//
// Pipeline: lexMath() -> parseLatex() (plain AST) -> latexToNodes() (React).
// Unknown commands/environments are recorded on the AST and latexToNodes()
// shows the complete source in the .dsc-math-fallback style; unbalanced braces
// and runaway nesting degrade to text instead of failing.

const MATH_MAX_SOURCE = 20000
const MATH_MAX_DEPTH = 64

// kind -> class name for a plain math character
const MATH_CHAR_CLASSES = {
  var: 'dsc-math-var', num: 'dsc-math-num', op: 'dsc-math-op',
  delim: 'dsc-math-delim', text: 'dsc-math-text',
}

const MATH_GREEK = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
  varkappa: 'ϰ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο', pi: 'π',
  rho: 'ρ', varrho: 'ϱ', sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ',
  phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
}
const MATH_UPPER_GREEK = {
  Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ', Epsilon: 'Ε', Zeta: 'Ζ',
  Eta: 'Η', Theta: 'Θ', Iota: 'Ι', Kappa: 'Κ', Lambda: 'Λ', Mu: 'Μ', Nu: 'Ν',
  Xi: 'Ξ', Omicron: 'Ο', Pi: 'Π', Rho: 'Ρ', Sigma: 'Σ', Tau: 'Τ',
  Upsilon: 'Υ', Phi: 'Φ', Chi: 'Χ', Psi: 'Ψ', Omega: 'Ω',
}
const MATH_SYMBOLS = {
  pm: '±', mp: '∓', times: '×', div: '÷', cdot: '⋅', ast: '∗', star: '⋆', circ: '∘', bullet: '•',
  le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈', equiv: '≡', sim: '∼',
  simeq: '≃', cong: '≅', propto: '∝', to: '→', rightarrow: '→', leftarrow: '←',
  leftrightarrow: '↔', Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', mapsto: '↦',
  longrightarrow: '⟶', longleftarrow: '⟵', longleftrightarrow: '⟷',
  Longrightarrow: '⟹', Longleftarrow: '⟸', Longleftrightarrow: '⟺',
  implies: '⟹', iff: '⟺', because: '∵', therefore: '∴',
  infty: '∞', partial: '∂', nabla: '∇', forall: '∀', exists: '∃', in: '∈', notin: '∉',
  ni: '∋', owns: '∋', notni: '∌', subset: '⊂', subseteq: '⊆', supset: '⊃', supseteq: '⊇',
  subsetneq: '⊊', supsetneq: '⊋', subsetneqq: '⫋', supsetneqq: '⫌',
  nsubseteq: '⊈', nsupseteq: '⊉', cup: '∪', cap: '∩',
  emptyset: '∅', varnothing: '∅', neg: '¬', lnot: '¬', land: '∧', lor: '∨',
  oplus: '⊕', ominus: '⊖', otimes: '⊗', oslash: '⊘', odot: '⊙', bigcirc: '◯',
  dagger: '†', ddagger: '‡', amalg: '⨿', wr: '≀',
  prec: '≺', succ: '≻', preceq: '⪯', succeq: '⪰', precsim: '≾', succsim: '≿',
  mid: '∣', nmid: '∤', vdash: '⊢', dashv: '⊣', models: '⊨', top: '⊤', bot: '⊥',
  triangle: '△', triangledown: '▽', square: '□', blacksquare: '■',
  lozenge: '◊', blacklozenge: '◆', angle: '∠', perp: '⊥', parallel: '∥',
  ldots: '…', cdots: '⋯', dots: '…', vdots: '⋮', ddots: '⋱',
  dotsb: '⋯', dotsc: '…', dotsi: '⋯', dotsm: '⋯', dotso: '…',
  prime: '′', hbar: 'ℏ', ell: 'ℓ', Re: 'ℜ', Im: 'ℑ', aleph: 'ℵ', wp: '℘',
}

const MATH_DELIMITER_SYMBOLS = {
  langle: '⟨', rangle: '⟩', lvert: '|', rvert: '|', lVert: '‖', rVert: '‖',
  vert: '|', Vert: '‖', '|': '‖', lfloor: '⌊', rfloor: '⌋', lceil: '⌈',
  rceil: '⌉', lbrace: '{', rbrace: '}', lbrack: '[', rbrack: ']',
  backslash: '\\', uparrow: '↑', downarrow: '↓', updownarrow: '↕',
  Uparrow: '⇑', Downarrow: '⇓', Updownarrow: '⇕',
  lgroup: '⟮', rgroup: '⟯', ulcorner: '⌜', urcorner: '⌝',
  llcorner: '⌞', lrcorner: '⌟', lbag: '⟅', rbag: '⟆',
  llbracket: '⟦', rrbracket: '⟧', lBrace: '⦃', rBrace: '⦄',
}

const MATH_ESCAPES = {
  '{': '{', '}': '}', '%': '%', '$': '$', '&': '&', '#': '#', '_': '_',
}

// command name -> em width (negative values pull the following text left)
const MATH_SPACES = {
  ',': 0.1667, ':': 0.2222, ';': 0.2778, '!': -0.1667, ' ': 0.3333,
  quad: 1, qquad: 2,
}

const MATH_FONTS = {
  mathrm: 'rm', mathbf: 'bf', mathit: 'it', mathsf: 'sf',
  mathtt: 'tt', mathcal: 'cal', mathscr: 'cal', mathbb: 'bb',
  boldsymbol: 'bf', bm: 'bf',
}

const MATH_ACCENTS = {
  hat: 'hat', widehat: 'hat', bar: 'bar', vec: 'vec', dot: 'dot',
  ddot: 'ddot', tilde: 'tilde', widetilde: 'tilde',
  check: 'check', breve: 'breve', acute: 'acute', grave: 'grave',
  overleftarrow: 'overleftarrow', overrightarrow: 'overrightarrow',
  overline: 'overline', underline: 'underline',
}

const MATH_ACCENT_MARKS = {
  hat: 'ˆ', bar: '¯', vec: '→', dot: '˙', ddot: '¨', tilde: '˜',
  check: 'ˇ', breve: '˘', acute: '´', grave: '`',
  overleftarrow: '←', overrightarrow: '→',
}

// Glyphs of large operators and function names; the sets below decide layout.
const MATH_BIG = {
  sum: '∑', prod: '∏', coprod: '∐', bigcup: '⋃', bigcap: '⋂', bigoplus: '⨁',
  int: '∫', iint: '∬', oint: '∮',
  lim: 'lim', max: 'max', min: 'min', sup: 'sup', inf: 'inf',
  log: 'log', ln: 'ln', exp: 'exp', sin: 'sin', cos: 'cos', tan: 'tan',
  cot: 'cot', sec: 'sec', csc: 'csc',
  sinh: 'sinh', cosh: 'cosh', tanh: 'tanh', coth: 'coth',
  arcsin: 'arcsin', arccos: 'arccos', arctan: 'arctan',
  arg: 'arg', deg: 'deg', dim: 'dim', hom: 'hom', ker: 'ker',
  det: 'det', gcd: 'gcd', mod: 'mod', bmod: 'mod',
  Pr: 'Pr',
}
// Limits stack above/below the glyph in display mode.
const MATH_BIG_LIMITS = new Set(['sum', 'prod', 'coprod', 'bigcup', 'bigcap', 'bigoplus', 'lim', 'max', 'min', 'sup', 'inf'])
// Function names stay upright and text-sized instead of using big-operator size.
const MATH_BIG_FUNCTIONS = new Set([
  'lim', 'max', 'min', 'sup', 'inf', 'log', 'ln', 'exp', 'sin', 'cos', 'tan',
  'cot', 'sec', 'csc', 'sinh', 'cosh', 'tanh', 'coth',
  'arcsin', 'arccos', 'arctan', 'arg', 'deg', 'dim', 'hom', 'ker',
  'det', 'gcd', 'mod', 'bmod', 'Pr',
])

// \big-family prefixes: accepted, rendered as a scaled plain delimiter
const MATH_BIG_DELIMITERS = {
  big: 1.2, Big: 1.5, bigg: 1.9, Bigg: 2.4,
  bigl: 1.2, bigr: 1.2, Bigl: 1.5, Bigr: 1.5,
  biggl: 1.9, biggr: 1.9, Biggl: 2.4, Biggr: 2.4,
  bigm: 1.2, Bigm: 1.5, biggm: 1.9, Biggm: 2.4,
}

// environment name -> delimiter pair (null / empty string means none)
const MATH_ENV_DELIMITERS = {
  matrix: null, aligned: null, align: null, 'align*': null, alignat: null, 'alignat*': null,
  alignedat: null, gathered: null, gather: null, 'gather*': null, split: null, array: null,
  equation: null, 'equation*': null, smallmatrix: null, subarray: null,
  multline: null, 'multline*': null, flalign: null, 'flalign*': null,
  eqnarray: null, 'eqnarray*': null, displaymath: null,
  pmatrix: { left: '(', right: ')' }, bmatrix: { left: '[', right: ']' },
  Bmatrix: { left: '{', right: '}' }, vmatrix: { left: '|', right: '|' },
  Vmatrix: { left: '‖', right: '‖' }, cases: { left: '{', right: '' },
}
const MATH_ENVIRONMENTS = new Set(Object.keys(MATH_ENV_DELIMITERS))
// These environments take a {cc} column specification after \begin{...}.
const MATH_COLSPEC_ENVIRONMENTS = new Set(['array', 'alignedat', 'alignat', 'alignat*', 'subarray'])
const MATH_IGNORED = new Set([
  'displaystyle', 'textstyle', 'scriptstyle', 'scriptscriptstyle',
  'limits', 'nolimits', 'nonumber', 'notag', 'allowbreak',
])
// stop sets drive the recursive row parser
const MATH_STOP_GROUP = { close: true }
const MATH_STOP_ARGUMENT = { close: true, align: true, rowbreak: true, right: true, end: true }
const MATH_STOP_ENV = { align: true, rowbreak: true, end: true }
const MATH_STOP_RIGHT = { right: true }
const MATH_STOP_INDEX = { close: true, char: ']' }

// ---------------------------------------------------------------------------
// Lexer: source string -> flat token list
// ---------------------------------------------------------------------------

function lexMath(source) {
  const tokens = []
  let index = 0
  while (index < source.length) {
    const char = source[index]
    if (char === '\\') {
      index += 1
      if (index >= source.length) break
      const next = source[index]
      if (/[A-Za-z]/.test(next)) {
        let name = ''
        while (index < source.length && /[A-Za-z]/.test(source[index])) {
          name += source[index]
          index += 1
        }
        tokens.push({ type: 'command', name })
        continue
      }
      index += 1
      if (next === '\\') {
        tokens.push({ type: 'rowbreak' })
        continue
      }
      tokens.push({ type: 'command', name: next })
      continue
    }
    if (char === '{') {
      tokens.push({ type: 'open' })
      index += 1
      continue
    }
    if (char === '}') {
      tokens.push({ type: 'close' })
      index += 1
      continue
    }
    if (char === '^') {
      tokens.push({ type: 'sup' })
      index += 1
      continue
    }
    if (char === '_') {
      tokens.push({ type: 'sub' })
      index += 1
      continue
    }
    if (char === '&') {
      tokens.push({ type: 'align' })
      index += 1
      continue
    }
    if (char === '~') {
      tokens.push({ type: 'space', size: 0.3333 })
      index += 1
      continue
    }
    if (/\s/.test(char)) {
      tokens.push({ type: 'space', size: 0 })
      index += 1
      continue
    }
    tokens.push({ type: 'char', value: char })
    index += 1
  }
  return tokens
}

function mathClassifyChar(char) {
  if ('0123456789.'.includes(char)) return 'num'
  if (/[A-Za-z]/.test(char)) return 'var'
  if (/[\u0370-\u03ff\u1d00-\u1fff]/.test(char)) return 'var'
  if ('()[]|'.includes(char)) return 'delim'
  if ('+-*/=<>!?,;:\'"%@#$&'.includes(char)) return 'op'
  return 'text'
}

// Reconstruct readable source-ish text for a token; used by the depth guard,
// raw \text arguments and error-tolerant renderings.
function mathCommandText(name) {
  if (MATH_ESCAPES[name] !== undefined) return MATH_ESCAPES[name]
  if (MATH_SPACES[name] !== undefined) return ' '
  return '\\' + name
}

function mathTokenText(token) {
  if (token.type === 'char') return token.value
  if (token.type === 'command') return mathCommandText(token.name)
  if (token.type === 'open') return '{'
  if (token.type === 'close') return '}'
  if (token.type === 'sup') return '^'
  if (token.type === 'sub') return '_'
  if (token.type === 'space') return ' '
  if (token.type === 'align') return '&'
  if (token.type === 'rowbreak') return '\\\\'
  return ''
}

// ---------------------------------------------------------------------------
// Parser: flat tokens -> plain AST
// ---------------------------------------------------------------------------

function mathTokenStops(token, stop) {
  if (stop === undefined || stop === null) return false
  if (token.type === 'close' && stop.close === true) return true
  if (token.type === 'align' && stop.align === true) return true
  if (token.type === 'rowbreak' && stop.rowbreak === true) return true
  if (token.type === 'char' && stop.char !== undefined && token.value === stop.char) return true
  if (token.type === 'command' && stop.right === true && token.name === 'right') return true
  if (token.type === 'command' && stop.end === true && token.name === 'end') return true
  return false
}

/**
 * Remember the first construct this renderer does not understand. Parsing
 * continues normally (so the output stays deterministic), but latexToNodes()
 * shows the whole formula source in the graceful fallback instead of a
 * half-rendered equation.
 */
function mathMarkUnsupported(state, kind, name) {
  if (state.unsupported === null || state.unsupported === undefined) {
    state.unsupported = { kind, name }
  }
}

function mathSkipSpaces(state) {
  while (state.index < state.tokens.length && state.tokens[state.index].type === 'space') {
    state.index += 1
  }
}

function mathReadLiteralGroup(state) {
  // state.index already points past the opening brace. The source is capped at
  // MATH_MAX_SOURCE, so keeping every character here stays small.
  let level = 1
  let text = ''
  while (state.index < state.tokens.length) {
    const token = state.tokens[state.index]
    if (token.type === 'open') level += 1
    if (token.type === 'close') {
      level -= 1
      if (level === 0) {
        state.index += 1
        break
      }
    }
    text += mathTokenText(token)
    state.index += 1
  }
  return text
}

function mathReadLiteralAtom(state) {
  const token = state.tokens[state.index]
  if (token === undefined) return null
  if (token.type === 'open') {
    state.index += 1
    return { type: 'text', value: mathReadLiteralGroup(state) }
  }
  state.index += 1
  return { type: 'text', value: mathTokenText(token) }
}

function parseMathGroup(state, depth) {
  // state.index points at the opening brace
  state.index += 1
  if (depth > MATH_MAX_DEPTH) return { type: 'text', value: mathReadLiteralGroup(state) }
  const items = parseMathRow(state, depth + 1, MATH_STOP_GROUP)
  const close = state.tokens[state.index]
  if (close !== undefined && close.type === 'close') state.index += 1
  return { type: 'group', items }
}

function parseMathArgument(state, depth) {
  const token = state.tokens[state.index]
  if (token === undefined) return null
  if (mathTokenStops(token, MATH_STOP_ARGUMENT)) return null
  return parseMathAtom(state, depth)
}

// Read a raw {...} argument for \text / \operatorname / environment names.
function mathReadRawGroup(state) {
  const token = state.tokens[state.index]
  if (token === undefined || token.type !== 'open') return ''
  state.index += 1
  let level = 1
  let text = ''
  while (state.index < state.tokens.length) {
    const current = state.tokens[state.index]
    if (current.type === 'open') level += 1
    if (current.type === 'close') {
      level -= 1
      if (level === 0) {
        state.index += 1
        break
      }
    }
    if (current.type === 'rowbreak') text += '\n'
    else if (current.type === 'command') text += mathCommandText(current.name)
    else text += mathTokenText(current)
    state.index += 1
  }
  return text
}

function mathReadRawText(state) {
  const token = state.tokens[state.index]
  if (token === undefined) return ''
  if (token.type === 'open') return mathReadRawGroup(state)
  state.index += 1
  return mathTokenText(token)
}

function mathReadDelimiter(state) {
  mathSkipSpaces(state)
  const token = state.tokens[state.index]
  if (token === undefined) return null
  if (token.type === 'char') {
    state.index += 1
    return token.value === '.' ? null : token.value
  }
  if (token.type === 'command') {
    state.index += 1
    if (MATH_DELIMITER_SYMBOLS[token.name] !== undefined) return MATH_DELIMITER_SYMBOLS[token.name]
    if (MATH_ESCAPES[token.name] !== undefined) return MATH_ESCAPES[token.name]
    // Not a delimiter: remember the unsupported command and keep its source
    // visible so the fallback can show the complete formula.
    mathMarkUnsupported(state, 'command', token.name)
    return mathCommandText(token.name)
  }
  return null
}

function parseMathRow(state, depth, stop) {
  const items = []
  while (state.index < state.tokens.length) {
    const token = state.tokens[state.index]
    if (mathTokenStops(token, stop)) break
    if (token.type === 'space') {
      state.index += 1
      if (token.size > 0) items.push({ type: 'space', size: token.size })
      continue
    }
    if (token.type === 'close') {
      // A stray '}' (unbalanced braces) must stay visible rather than vanish.
      state.index += 1
      mathPushChar(items, '}', 'text')
      continue
    }
    if (token.type === 'align') {
      state.index += 1
      mathPushChar(items, '&', 'op')
      continue
    }
    if (token.type === 'rowbreak') {
      state.index += 1
      items.push({ type: 'rowbreak' })
      continue
    }
    if (token.type === 'sup' || token.type === 'sub') {
      // Script with no preceding atom: attach it to an empty base.
      state.index += 1
      const argument = parseMathArgument(state, depth + 1)
      const base = mathTakeLastAtom(items)
      items.push(mathMakeScripted(base, token.type === 'sub' ? argument : null, token.type === 'sup' ? argument : null))
      continue
    }
    const before = state.index
    const atom = parseMathAtom(state, depth)
    if (atom === null) {
      if (state.index === before) state.index += 1
      continue
    }
    const scripted = parseMathScripts(state, depth, atom)
    if (scripted.type === 'char') mathPushChar(items, scripted.value, scripted.kind)
    else items.push(scripted)
  }
  return items
}

function mathPushChar(items, value, kind) {
  const last = items[items.length - 1]
  if (last !== undefined && last.type === 'run' && last.kind === kind) {
    last.value += value
    return
  }
  items.push({ type: 'run', kind, value })
}

function mathTakeLastAtom(items) {
  if (items.length === 0) return null
  const index = items.length - 1
  const last = items[index]
  if (last.type === 'run') {
    if (last.value.length > 1) {
      items[index] = { type: 'run', kind: last.kind, value: last.value.slice(0, -1) }
      return { type: 'char', value: last.value.slice(-1), kind: last.kind }
    }
    items.pop()
    return { type: 'char', value: last.value, kind: last.kind }
  }
  items.pop()
  return last
}

function mathMakeScripted(base, sub, sup) {
  if (sub === null && sup === null) return base
  if (base !== null && base.type === 'bigop') {
    return { ...base, sub: base.sub || sub, sup: base.sup || sup }
  }
  return { type: 'scripts', base, sub, sup }
}

function parseMathScripts(state, depth, atom) {
  let base = atom
  let sub = null
  let sup = null
  while (state.index < state.tokens.length) {
    const token = state.tokens[state.index]
    if (token.type !== 'sup' && token.type !== 'sub') break
    state.index += 1
    const argument = parseMathArgument(state, depth + 1)
    if (token.type === 'sup' && sup === null) {
      sup = argument
      continue
    }
    if (token.type === 'sub' && sub === null) {
      sub = argument
      continue
    }
    // Repeated x^a^b is invalid LaTeX; keep both scripts by nesting them.
    base = mathMakeScripted(base, sub, sup)
    sub = null
    sup = null
    if (token.type === 'sup') sup = argument
    else sub = argument
  }
  return mathMakeScripted(base, sub, sup)
}

function parseMathAtom(state, depth) {
  if (depth > MATH_MAX_DEPTH) return mathReadLiteralAtom(state)
  const token = state.tokens[state.index]
  if (token === undefined) return null
  if (token.type === 'open') return parseMathGroup(state, depth)
  if (token.type === 'char') {
    state.index += 1
    return { type: 'char', value: token.value, kind: mathClassifyChar(token.value) }
  }
  if (token.type === 'command') {
    state.index += 1
    return parseMathCommand(state, token.name, depth + 1)
  }
  return null
}

function parseMathCommand(state, name, depth) {
  if (MATH_IGNORED.has(name)) return null
  if (name === 'tag' || name === 'label') {
    // Equation labels are metadata: accept them, render the formula itself.
    mathSkipSpaces(state)
    const star = state.tokens[state.index]
    if (star !== undefined && star.type === 'char' && star.value === '*') state.index += 1
    parseMathArgument(state, depth)
    return null
  }
  if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
    const num = parseMathArgument(state, depth)
    const den = parseMathArgument(state, depth)
    return { type: 'frac', num, den, style: name === 'dfrac' ? 'display' : name === 'tfrac' ? 'text' : 'auto' }
  }
  if (name === 'binom') {
    const top = parseMathArgument(state, depth)
    const bottom = parseMathArgument(state, depth)
    return { type: 'binom', top, bottom }
  }
  if (name === 'sqrt') {
    let index = null
    mathSkipSpaces(state)
    const next = state.tokens[state.index]
    if (next !== undefined && next.type === 'char' && next.value === '[') {
      state.index += 1
      index = { type: 'group', items: parseMathRow(state, depth + 1, MATH_STOP_INDEX) }
      const close = state.tokens[state.index]
      if (close !== undefined && close.type === 'char' && close.value === ']') state.index += 1
    }
    return { type: 'sqrt', index, body: parseMathArgument(state, depth) }
  }
  if (name === 'left') return parseMathLeftRight(state, depth)
  if (name === 'begin') return parseMathEnvironment(state, depth)
  if (MATH_BIG_DELIMITERS[name] !== undefined) {
    const glyph = mathReadDelimiter(state)
    if (glyph === null) return null
    return { type: 'delimiter', glyph, size: MATH_BIG_DELIMITERS[name] }
  }
  if (MATH_SPACES[name] !== undefined) return { type: 'space', size: MATH_SPACES[name] }
  if (MATH_GREEK[name] !== undefined) return { type: 'char', value: MATH_GREEK[name], kind: 'var' }
  if (MATH_UPPER_GREEK[name] !== undefined) return { type: 'char', value: MATH_UPPER_GREEK[name], kind: 'text' }
  if (MATH_DELIMITER_SYMBOLS[name] !== undefined) return { type: 'char', value: MATH_DELIMITER_SYMBOLS[name], kind: 'delim' }
  if (MATH_SYMBOLS[name] !== undefined) return { type: 'char', value: MATH_SYMBOLS[name], kind: 'op' }
  if (MATH_ESCAPES[name] !== undefined) {
    return { type: 'char', value: MATH_ESCAPES[name], kind: mathClassifyChar(MATH_ESCAPES[name]) }
  }
  if (name === 'text') return { type: 'text', value: mathReadRawText(state) }
  if (name === 'mbox') return { type: 'text', value: mathReadRawText(state) }
  if (name === 'operatorname') {
    // Parsed as math so spacing commands inside it still work; the "op"
    // variant below renders the result upright.
    mathSkipSpaces(state)
    const star = state.tokens[state.index]
    if (star !== undefined && star.type === 'char' && star.value === '*') state.index += 1
    return { type: 'font', variant: 'op', body: parseMathArgument(state, depth) }
  }
  if (MATH_FONTS[name] !== undefined) {
    return { type: 'font', variant: MATH_FONTS[name], body: parseMathArgument(state, depth) }
  }
  if (MATH_ACCENTS[name] !== undefined) {
    return { type: 'accent', kind: MATH_ACCENTS[name], body: parseMathArgument(state, depth) }
  }
  if (MATH_BIG[name] !== undefined) {
    return {
      type: 'bigop', name, glyph: MATH_BIG[name], sub: null, sup: null,
      limits: MATH_BIG_LIMITS.has(name), large: !MATH_BIG_FUNCTIONS.has(name),
    }
  }
  mathMarkUnsupported(state, 'command', name)
  return { type: 'unknown', name }
}

function parseMathLeftRight(state, depth) {
  const left = mathReadDelimiter(state)
  if (state.tokens[state.index] === undefined) throw new Error('Unmatched \\left')
  const items = parseMathRow(state, depth + 1, MATH_STOP_RIGHT)
  const token = state.tokens[state.index]
  if (token === undefined || token.type !== 'command' || token.name !== 'right') {
    throw new Error('Unmatched \\left')
  }
  state.index += 1
  const right = mathReadDelimiter(state)
  return { type: 'delimited', left, right, items }
}

function parseMathEnvironment(state, depth) {
  mathSkipSpaces(state)
  const envName = state.tokens[state.index] !== undefined && state.tokens[state.index].type === 'open'
    ? mathReadRawGroup(state).trim()
    : ''
  if (!MATH_ENVIRONMENTS.has(envName)) {
    // Unknown environments are still consumed as rows (the parser must reach
    // the matching \end), but the whole formula will render as source text.
    mathMarkUnsupported(state, 'environment', envName)
  }
  // \begin{array}{cc} and \begin{alignedat}{2}: the column spec is accepted
  // and ignored; the layout comes from each row's cells. A space may sit
  // between the environment name and the spec.
  mathSkipSpaces(state)
  if (MATH_COLSPEC_ENVIRONMENTS.has(envName) && state.tokens[state.index] !== undefined && state.tokens[state.index].type === 'open') {
    mathReadRawGroup(state)
  }
  const rows = []
  let cells = []
  let guard = 0
  let closed = false
  while (state.index < state.tokens.length && guard < 4096) {
    guard += 1
    const token = state.tokens[state.index]
    if (token.type === 'command' && token.name === 'end') break
    const items = parseMathRow(state, depth + 1, MATH_STOP_ENV)
    const next = state.tokens[state.index]
    const hasMore = next !== undefined && !(next.type === 'command' && next.name === 'end')
    if (items.length > 0 || hasMore) cells.push({ type: 'group', items })
    if (!hasMore) break
    if (next.type === 'align') {
      state.index += 1
      continue
    }
    if (next.type === 'rowbreak') {
      state.index += 1
      rows.push(cells)
      cells = []
      continue
    }
    break
  }
  if (cells.length > 0) rows.push(cells)
  if (rows.length === 0) rows.push([])
  const endToken = state.tokens[state.index]
  if (endToken !== undefined && endToken.type === 'command' && endToken.name === 'end') {
    state.index += 1
    mathSkipSpaces(state)
    const endName = state.tokens[state.index] !== undefined && state.tokens[state.index].type === 'open'
      ? mathReadRawGroup(state).trim()
      : ''
    if (endName === envName) closed = true
    else mathMarkUnsupported(state, 'environment', envName)
  }
  if (!closed) {
    // A streamed "\begin{bmatrix} ..." without its \end must not be painted as
    // a half matrix: remember the mismatch so latexToNodes() shows the source.
    mathMarkUnsupported(state, 'environment', envName)
  }
  return { type: 'matrix', env: envName, rows }
}

function parseLatex(source) {
  if (typeof source !== 'string') throw new TypeError('LaTeX source must be a string')
  if (source.length > MATH_MAX_SOURCE) return { type: 'plain', source }
  const state = { tokens: lexMath(source), index: 0, unsupported: null }
  const ast = { type: 'row', items: parseMathRow(state, 0, null), source }
  if (state.unsupported !== null) ast.unsupported = state.unsupported
  return ast
}

// ---------------------------------------------------------------------------
// Renderer: plain AST -> React elements
// ---------------------------------------------------------------------------

function mathCharClass(kind, context) {
  const variant = context.variant
  if (variant === 'rm' || variant === 'bb' || variant === 'sf' || variant === 'tt') {
    if (kind === 'op') return 'dsc-math-op'
    if (kind === 'delim') return 'dsc-math-delim'
    return 'dsc-math-text'
  }
  if (variant === 'op') return 'dsc-math-op'
  if (variant === 'cal') return 'dsc-math-var'
  return MATH_CHAR_CLASSES[kind] || 'dsc-math-text'
}

function mathCharStyle(context) {
  const variant = context.variant
  if (variant === 'bf') return { fontWeight: '700' }
  if (variant === 'sf') return { fontFamily: 'sans-serif' }
  if (variant === 'tt') return { fontFamily: 'monospace' }
  if (variant === 'cal') return { fontStyle: 'italic' }
  return undefined
}

function mathRenderChars(kind, value, context, key) {
  return h('span', { className: mathCharClass(kind, context), key, style: mathCharStyle(context) }, value)
}

function mathRenderItems(items, context, keyPrefix) {
  return items.map((item, index) => renderMathNode(item, context, `${keyPrefix}-${index}`))
}

// Render an argument (group or single atom) as a child array.
function mathRenderContent(value, context, key) {
  if (value === null || value === undefined) return []
  if (value.type === 'group') return mathRenderItems(value.items, context, key)
  return [renderMathNode(value, context, key)]
}

function mathRenderSpace(size, key) {
  if (size < 0) {
    return h('span', {
      className: 'dsc-math-space',
      key,
      style: { display: 'inline-block', width: '0em', marginLeft: `${size.toFixed(4)}em` },
    })
  }
  return h('span', {
    className: 'dsc-math-space',
    key,
    style: { display: 'inline-block', width: `${size.toFixed(4)}em` },
  })
}

function mathRenderFrac(node, context, key) {
  const childContext = node.style === 'display'
    ? { ...context, display: true }
    : node.style === 'text'
      ? { ...context, display: false }
      : context
  return h('span', { className: 'dsc-math-frac', key },
    h('span', { className: 'dsc-math-frac-num' }, mathRenderContent(node.num, childContext, `${key}-n`)),
    h('span', { className: 'dsc-math-frac-den' }, mathRenderContent(node.den, childContext, `${key}-d`)),
  )
}

function mathRenderBinom(node, context, key) {
  // A binomial is a one-column matrix wrapped in taller-than-text parentheses.
  const grid = mathRenderMatrix({ type: 'matrix', env: 'matrix', rows: [[node.top], [node.bottom]] }, context, key)
  const parenStyle = { fontSize: '1.5em', lineHeight: 1 }
  return h('span', { key, style: { display: 'inline-flex', alignItems: 'center' } },
    h('span', { className: 'dsc-math-delim', key: `${key}-l`, style: parenStyle }, '('),
    grid,
    h('span', { className: 'dsc-math-delim', key: `${key}-r`, style: parenStyle }, ')'),
  )
}

function mathRenderSqrt(node, context, key) {
  return h('span', { className: 'dsc-math-sqrt', key },
    node.index === null
      ? null
      // The stylesheet draws the radical with ::before; order puts the index on
      // its left where TeX puts it (the CSS margin tucks it into the radical).
      : h('span', { className: 'dsc-math-sqrt-index', style: { order: -1 } }, mathRenderContent(node.index, context, `${key}-i`)),
    h('span', { className: 'dsc-math-sqrt-body' }, mathRenderContent(node.body, context, `${key}-b`)),
  )
}

function mathRenderBig(node, context, key) {
  const glyph = h('span', {
    className: node.large ? 'dsc-math-big' : 'dsc-math-op',
    key: `${key}-g`,
  }, node.glyph)
  const supContent = node.sup === null ? null : mathRenderContent(node.sup, context, `${key}-p`)
  const subContent = node.sub === null ? null : mathRenderContent(node.sub, context, `${key}-s`)
  if (node.limits && context.display === true && (supContent !== null || subContent !== null)) {
    // The glyph stays in normal flow so the stack's baseline is the operator's
    // baseline: text after \sum still lines up with the operator. The limits are
    // drawn above/below it and the padding reserves their vertical room.
    const limitStyle = {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: '0.72em',
      lineHeight: 1.05,
      whiteSpace: 'nowrap',
    }
    const stacked = {
      display: 'inline-block',
      position: 'relative',
      textAlign: 'center',
      lineHeight: 1,
      padding: '0.8em 0.3em',
    }
    return h('span', { key, style: stacked },
      supContent === null ? null : h('span', { className: 'dsc-math-sup', key: `${key}-p`, style: { ...limitStyle, top: 0 } }, supContent),
      glyph,
      subContent === null ? null : h('span', { className: 'dsc-math-sub', key: `${key}-s`, style: { ...limitStyle, bottom: 0 } }, subContent),
    )
  }
  const sup = supContent === null ? null : h('span', { className: 'dsc-math-sup', key: `${key}-p` }, supContent)
  const sub = subContent === null ? null : h('span', { className: 'dsc-math-sub', key: `${key}-s` }, subContent)
  if (sup === null && sub === null) return glyph
  // Inline limits stay to the right, stacked vertically like x_i^2.
  const scriptStyle = sup !== null && sub !== null
    ? {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      lineHeight: '1.02',
      verticalAlign: 'middle',
    }
    : undefined
  return h('span', { key }, glyph, h('span', { className: 'dsc-math-script', style: scriptStyle }, sup, sub))
}

function mathRenderScripted(node, context, key) {
  const base = node.base === null ? null : renderMathNode(node.base, context, `${key}-b`)
  const sup = node.sup === null
    ? null
    : h('span', { className: 'dsc-math-sup', key: `${key}-p` }, mathRenderContent(node.sup, context, `${key}-p`))
  const sub = node.sub === null
    ? null
    : h('span', { className: 'dsc-math-sub', key: `${key}-s` }, mathRenderContent(node.sub, context, `${key}-s`))
  // x_i^2 needs the two scripts stacked; x^2 / x_i can rely on the class rules.
  const stacked = sup !== null && sub !== null
  const scriptStyle = stacked
    ? {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      lineHeight: '1.02',
      verticalAlign: 'middle',
    }
    : undefined
  return h('span', { key }, base, h('span', { className: 'dsc-math-script', style: scriptStyle }, sup, sub))
}

function mathEstimateHeight(value, context) {
  if (value === null || value === undefined) return 1
  if (value.type === 'group') {
    let height = 1
    for (const item of value.items) height = Math.max(height, mathEstimateHeight(item, context))
    return height
  }
  if (value.type === 'frac' || value.type === 'binom') return 2.35
  if (value.type === 'sqrt') return mathEstimateHeight(value.body, context) + 0.2
  if (value.type === 'matrix') return Math.max(1, value.rows.length * 1.15)
  if (value.type === 'scripts') {
    return Math.max(
      1.15,
      mathEstimateHeight(value.base, context),
      mathEstimateHeight(value.sup, context),
      mathEstimateHeight(value.sub, context),
    )
  }
  if (value.type === 'bigop') return context.display && value.limits ? 2.8 : 1.15
  if (value.type === 'delimited') {
    let height = 1
    for (const item of value.items) height = Math.max(height, mathEstimateHeight(item, context))
    return height + 0.15
  }
  if (value.type === 'accent') return mathEstimateHeight(value.body, context) + 0.25
  if (value.type === 'font') return mathEstimateHeight(value.body, context)
  return 1
}

function mathRenderDelimiters(left, right, scale, key) {
  const style = scale > 1.05 ? { fontSize: `${scale.toFixed(2)}em`, lineHeight: 1 } : undefined
  return [
    left === null ? null : h('span', { className: 'dsc-math-delim', key: `${key}-l`, style }, left),
    right === null ? null : h('span', { className: 'dsc-math-delim', key: `${key}-r`, style }, right),
  ]
}

function mathRenderDelimited(node, context, key) {
  const content = mathRenderItems(node.items, context, `${key}-c`)
  const height = Math.max(1, Math.min(3.2, mathEstimateHeight({ type: 'group', items: node.items }, context)))
  const [left, right] = mathRenderDelimiters(node.left, node.right, height, key)
  return h('span', { key, style: { display: 'inline-flex', alignItems: 'center' } },
    left,
    h('span', { className: 'dsc-math-row' }, content),
    right,
  )
}

function mathRenderMatrix(node, context, key) {
  const rows = node.rows.length === 0 ? [[]] : node.rows
  // `grid-auto-flow: row` with only implicit tracks would create a single
  // column and stack every cell vertically. Pin the column count to the
  // widest row so a 3x3 bmatrix is really laid out as 3 rows by 3 columns.
  let columns = 1
  for (const row of rows) columns = Math.max(columns, row.length)
  const grid = h('span', {
    className: 'dsc-math-matrix',
    key: `${key}-m`,
    role: 'table',
    style: { gridTemplateColumns: `repeat(${columns}, auto)` },
  },
    rows.map((row, rowIndex) => (
      h('span', { className: 'dsc-math-matrix-row', key: `${key}-r${rowIndex}`, role: 'row' },
        row.map((cell, cellIndex) => (
          h('span', { className: 'dsc-math-matrix-cell', key: `${key}-c${rowIndex}-${cellIndex}`, role: 'cell' },
            mathRenderContent(cell, context, `${key}-c${rowIndex}-${cellIndex}`))
        )),
      )
    )),
  )
  const spec = MATH_ENV_DELIMITERS[node.env] || null
  if (spec === null) return grid
  if (spec.left === '[' && spec.right === ']') {
    // Square brackets are drawn with borders so they stretch to the matrix
    // height instead of scaling a single glyph around the middle row.
    return h('span', { key, className: 'dsc-math-matrix-frame', style: { display: 'inline-flex', alignItems: 'stretch' } },
      h('span', { className: 'dsc-math-matrix-bracket dsc-math-matrix-bracket-left', key: `${key}-l`, 'aria-hidden': 'true' },
        h('span', { className: 'dsc-math-matrix-bracket-glyph' }, '[')),
      grid,
      h('span', { className: 'dsc-math-matrix-bracket dsc-math-matrix-bracket-right', key: `${key}-r`, 'aria-hidden': 'true' },
        h('span', { className: 'dsc-math-matrix-bracket-glyph' }, ']')),
    )
  }
  const scale = Math.max(1, Math.min(3.2, 0.95 + rows.length * 0.45))
  const [left, right] = mathRenderDelimiters(spec.left || null, spec.right || null, scale, key)
  return h('span', { key, style: { display: 'inline-flex', alignItems: 'center' } }, left, grid, right)
}

function mathRenderAccent(node, context, key) {
  const content = mathRenderContent(node.body, context, `${key}-a`)
  if (node.kind === 'overline' || node.kind === 'underline') {
    const overline = node.kind === 'overline'
    const style = {
      display: 'inline-block',
      lineHeight: 1.1,
      paddingTop: overline ? '0.08em' : '0',
      paddingBottom: overline ? '0' : '0.08em',
    }
    if (overline) style.borderTop = '1px solid currentColor'
    else style.borderBottom = '1px solid currentColor'
    return h('span', { key, style }, content)
  }
  const mark = MATH_ACCENT_MARKS[node.kind] || 'ˆ'
  return h('span', {
    key,
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      verticalAlign: 'middle',
      lineHeight: '1.05',
    },
  },
  h('span', { key: `${key}-m`, style: { fontSize: '0.75em', lineHeight: 1, height: '0.5em' } }, mark),
  h('span', { className: 'dsc-math-row', style: { lineHeight: 1.1 } }, content),
  )
}

function renderMathNode(node, context, key) {
  if (node === null || node === undefined) return null
  if (node.type === 'run' || node.type === 'char') return mathRenderChars(node.kind, node.value, context, key)
  if (node.type === 'text') return h('span', { className: 'dsc-math-text', key, style: { whiteSpace: 'pre' } }, node.value)
  if (node.type === 'group') return h('span', { className: 'dsc-math-row', key }, mathRenderItems(node.items, context, key))
  if (node.type === 'space') return mathRenderSpace(node.size, key)
  if (node.type === 'frac') return mathRenderFrac(node, context, key)
  if (node.type === 'binom') return mathRenderBinom(node, context, key)
  if (node.type === 'sqrt') return mathRenderSqrt(node, context, key)
  if (node.type === 'bigop') return mathRenderBig(node, context, key)
  if (node.type === 'scripts') return mathRenderScripted(node, context, key)
  if (node.type === 'delimited') return mathRenderDelimited(node, context, key)
  if (node.type === 'delimiter') {
    return h('span', { className: 'dsc-math-delim', key, style: { fontSize: `${node.size.toFixed(2)}em` } }, node.glyph)
  }
  if (node.type === 'matrix') return mathRenderMatrix(node, context, key)
  if (node.type === 'accent') return mathRenderAccent(node, context, key)
  if (node.type === 'font') {
    return h('span', { className: 'dsc-math-row', key },
      mathRenderContent(node.body, { ...context, variant: node.variant }, key))
  }
  if (node.type === 'unknown') {
    return h('span', { className: 'dsc-math-text', key, style: { opacity: 0.65 } }, '\\' + node.name)
  }
  if (node.type === 'rowbreak') return h('span', { className: 'dsc-math-text', key }, '\\\\')
  return null
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function latexToNodes(source, { display = false } = {}) {
  const text = typeof source === 'string' ? source : source === null || source === undefined ? '' : String(source)
  if (text.trim() === '') return []
  try {
    if (text.length > MATH_MAX_SOURCE) return [h('span', { className: 'dsc-math-text', key: 'm' }, text)]
    const ast = parseLatex(text)
    if (ast.type === 'plain') return [h('span', { className: 'dsc-math-text', key: 'm' }, ast.source)]
    if (ast.unsupported !== undefined) {
      // Unsupported commands/environments keep their complete LaTeX source,
      // in monospace with a quiet background, instead of disappearing or
      // printing a half-rendered equation.
      return [h('span', {
        className: 'dsc-math-fallback',
        key: 'm',
        title: tr('mathUnsupported'),
      }, text)]
    }
    const context = { display: display === true, variant: null }
    return [h('span', { className: 'dsc-math-row', key: 'm' }, mathRenderItems(ast.items, context, 'm'))]
  } catch (error) {
    // Rendering problems must never drop the formula: show its source instead.
    return [h('span', { className: 'dsc-math-error', key: 'm', title: tr('mathFailed') }, text)]
  }
}

function LatexInline({ tex }) {
  const nodes = React.useMemo(() => latexToNodes(tex, { display: false }), [tex])
  return h('span', { className: 'dsc-math dsc-math-inline' }, nodes)
}

function LatexBlock({ tex }) {
  const nodes = React.useMemo(() => latexToNodes(tex, { display: true }), [tex])
  return h('div', { className: 'dsc-math dsc-math-block' }, nodes)
}
