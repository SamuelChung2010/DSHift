// Verify client-src/31-highlight.js: the character-preservation invariant for
// every supported language, alias normalisation, representative classifications,
// unterminated constructs and a large-block performance bound.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = readFileSync(path.join(root, 'client-src/31-highlight.js'), 'utf8')
const context = { console }
vm.createContext(context)
vm.runInContext(`${source}\n;globalThis.__highlight = { normalizeCodeLang, highlightCode, highlightLines }`, context)
const { normalizeCodeLang, highlightCode, highlightLines } = context.__highlight

const TYPES = new Set(['', 'kw', 'str', 'num', 'com', 'fn', 'type', 'op', 'attr', 'tag', 'var', 'meta'])
let checks = 0

function check(condition, message) {
  if (!condition) throw new Error(message)
  checks += 1
}

function join(tokens) {
  return tokens.map(token => token.text).join('')
}

function has(tokens, type, text) {
  return tokens.some(token => token.type === type && token.text === text)
}

function hasType(tokens, type) {
  return tokens.some(token => token.type === type)
}

const SAMPLES = {
  javascript: [
    '// build a greeting',
    'export function greet(name) {',
    '  const pattern = /[a-z]+/gi',
    '  const count = 0x2a + 1_000 + 1.5e3',
    '  return `hi ${name.toUpperCase()} ${count > 0 ? "yes" : "no"}`',
    '}',
    'const view = <span className="badge">{greet("world")}</span>',
  ].join('\n'),
  typescript: [
    'interface Greeter<T> {',
    '  readonly name: string',
    '  greet(value: T): Promise<void>',
    '}',
    'export class BasicGreeter implements Greeter<number> {',
    '  constructor(private readonly label: string) {}',
    '  greet(value: number): void { console.log(`#${value} ${this.label}`) }',
    '}',
  ].join('\n'),
  json: '{"name": "dsh", "version": 1, "ok": true, "items": [1, 2.5e3, null]}',
  markup: [
    '<!DOCTYPE html>',
    '<main class="page" data-id="42">',
    '  <h1>Hello &amp; welcome</h1>',
    '  <img src="logo.svg" alt="" />',
    '  <!-- a note -->',
    '</main>',
  ].join('\n'),
  css: [
    ':root { --accent: #4f8cff; }',
    '.card:hover {',
    '  color: var(--accent);',
    '  margin: 1.5rem auto;',
    '  background: url("bg.png") no-repeat;',
    '}',
  ].join('\n'),
  python: [
    'import os',
    'from typing import List',
    '',
    'class Greeter:',
    '    """A small helper."""',
    '    def greet(self, name: str, times: int = 1) -> str:',
    '        # build the message',
    '        parts = [f"hello {name}" for _ in range(times)]',
    '        return " ".join(parts)',
    '',
    'if __name__ == "__main__":',
    '    print(Greeter().greet("dsh"))',
  ].join('\n'),
  bash: [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    'name="${1:-world}"',
    'for file in *.txt; do',
    '  # skip empty matches',
    '  [[ -f "$file" ]] || continue',
    '  echo "hello $name from $file"',
    'done',
  ].join('\n'),
  powershell: [
    '<#',
    '.SYNOPSIS',
    'Example script',
    '#>',
    "param([string]$Name = 'world')",
    '$items = Get-ChildItem -Path . -Filter *.txt',
    'foreach ($item in $items) {',
    '  Write-Host "Hello $Name from $($item.Name)"',
    '}',
  ].join('\n'),
  sql: [
    '-- daily totals',
    'SELECT u.id, COUNT(*) AS total',
    'FROM users AS u',
    'LEFT JOIN orders AS o ON o.user_id = u.id',
    "WHERE o.created_at >= DATE '2024-01-01' AND u.active = TRUE",
    'GROUP BY u.id',
    'ORDER BY total DESC',
    'LIMIT 10;',
  ].join('\n'),
  java: [
    '@Deprecated',
    'public final class Demo<T> {',
    '  private static final int LIMIT = 32;',
    '  public static void main(String[] args) {',
    '    // greet',
    '    List<String> names = new ArrayList<>();',
    '    names.forEach(name -> System.out.println("hi " + name));',
    '  }',
    '}',
  ].join('\n'),
  csharp: [
    '#region Helpers',
    'using System;',
    'public sealed class Demo {',
    '  [Obsolete]',
    '  public string Name { get; init; } = "dsh";',
    '  public void Run() => Console.WriteLine($"Hello {Name}");',
    '}',
    '#endregion',
  ].join('\n'),
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    'namespace demo {',
    'template <typename T>',
    'T sum(const std::vector<T>& values) {',
    '  T total{};',
    '  for (const auto& value : values) total += value; // accumulate',
    '  return total;',
    '}',
    '}',
  ].join('\n'),
  c: [
    '#include <stdio.h>',
    'int main(void) {',
    '  char buffer[64];',
    '  const char* msg = "hello\\tworld";',
    '  // print',
    '  printf("%s\\n", msg);',
    '  return 0;',
    '}',
  ].join('\n'),
  go: [
    'package main',
    '',
    'import "fmt"',
    '',
    'func main() {',
    '  values := []string{"a", "b"}',
    '  total := 0',
    '  for _, value := range values {',
    '    // sum lengths',
    '    total += len(value)',
    '    fmt.Println(`raw ${not} value`, value, total)',
    '  }',
    '}',
  ].join('\n'),
  rust: [
    'use std::collections::HashMap;',
    '',
    '#[derive(Debug, Clone)]',
    "struct Cache<'a> {",
    "    name: &'a str,",
    '    items: HashMap<String, usize>,',
    '}',
    '',
    'fn main() {',
    '    let mut cache = Cache { name: "demo", items: HashMap::new() };',
    '    // count',
    '    cache.items.insert("a".to_string(), 1);',
    '    println!("{} {:?}", cache.name, cache.items);',
    '}',
  ].join('\n'),
  yaml: [
    'name: dsh-chat-experience',
    'version: 0.1.0',
    'enabled: true',
    'items:',
    '  - one',
    '  - two: 2',
    '    nested: null',
    'script: |',
    '  echo "hello: world"',
    '  exit 0',
    'anchors: &base',
    '  retries: 3',
    'ref: *base',
  ].join('\n'),
  markdown: [
    '# Heading',
    'Paragraph with **bold**, `code` and a [link](https://example.com).',
    '- item one',
    '> quote',
    '',
    '```js',
    'const x = 1',
    '```',
  ].join('\n'),
  diff: [
    '--- a/app.js',
    '+++ b/app.js',
    '@@ -1,3 +1,4 @@',
    ' line one',
    '-old line',
    '+new line',
    ' line two',
  ].join('\n'),
  kotlin: [
    'data class User(val name: String, val age: Int)',
    'fun main() {',
    '    val user = User("dsh", 3)',
    '    // greet',
    '    println("Hi ${user.name}")',
    '}',
  ].join('\n'),
  text: 'plain text 123 !!!',
  mermaid: 'graph TD\nA[Start] --> B{Choice}',
}

for (const [lang, sample] of Object.entries(SAMPLES)) {
  const tokens = highlightCode(sample, lang)
  check(Array.isArray(tokens), `${lang}: result is an array`)
  check(join(tokens) === sample, `${lang}: tokens join back to the source`)
  for (const token of tokens) {
    check(typeof token.text === 'string' && token.text !== '', `${lang}: token has non-empty text`)
    check(TYPES.has(token.type), `${lang}: unknown token type ${JSON.stringify(token.type)}`)
  }
  const rows = highlightLines(sample, lang)
  check(Array.isArray(rows) && rows.length > 0, `${lang}: line array`)
  check(rows.map(row => join(row)).join('\n') === sample, `${lang}: rows join back to the source`)
  for (const row of rows) {
    for (const token of row) {
      check(typeof token.text === 'string', `${lang}: row token text`)
      check(!token.text.includes('\n'), `${lang}: row token contains a newline`)
    }
  }
  if (lang === 'text' || lang === 'mermaid') {
    check(tokens.length === 1 && tokens[0].type === '', `${lang}: single plain token`)
  }
}

const aliases = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  py: 'python',
  sh: 'bash', shell: 'bash', zsh: 'bash', bash: 'bash',
  ps1: 'powershell', pwsh: 'powershell', powershell: 'powershell',
  yml: 'yaml',
  c: 'c', h: 'c',
  'c++': 'cpp', cc: 'cpp', hpp: 'cpp',
  cs: 'csharp',
  rs: 'rust',
  golang: 'go',
  kt: 'kotlin',
  html: 'markup', htm: 'markup', xml: 'markup', svg: 'markup', vue: 'markup', svelte: 'markup',
  jsonc: 'json',
  md: 'markdown',
  text: 'text', plain: 'text', txt: 'text',
}
for (const [input, expected] of Object.entries(aliases)) {
  check(normalizeCodeLang(input) === expected, `alias ${input} -> ${expected} (got ${normalizeCodeLang(input)})`)
}
for (const input of ['', '   ', undefined, null, 'brainfuck', 'no-such-lang']) {
  check(normalizeCodeLang(input) === 'text', `unknown ${String(input)} -> text`)
}
check(normalizeCodeLang('JS') === 'javascript', 'aliases are case insensitive')
check(normalizeCodeLang('language-ts') === 'typescript', 'language- prefix is stripped')

const python = highlightCode('def foo():\n    # comment\n    return "abc"\n', 'python')
check(has(python, 'kw', 'def'), 'python: def is a keyword')
check(has(python, 'fn', 'foo'), 'python: declared function name')
check(has(python, 'com', '# comment'), 'python: hash comment')
check(has(python, 'str', '"abc"'), 'python: string')

const javascript = highlightCode('const x = 1', 'javascript')
check(has(javascript, 'kw', 'const'), 'javascript: const keyword')
check(has(javascript, 'num', '1'), 'javascript: number')
check(hasType(highlightCode('const re = /ab+c/gi', 'javascript'), 'str'), 'javascript: regex is a string token')
check(hasType(highlightCode('const s = `a${1 + 2}b`', 'javascript'), 'str'), 'javascript: template literal is a string token')

const markup = highlightCode('<div class="a">x</div>', 'markup')
check(has(markup, 'tag', 'div'), 'markup: tag name')
check(has(markup, 'attr', 'class'), 'markup: attribute name')
check(has(markup, 'str', '"a"'), 'markup: attribute value')

const json = highlightCode('{"a": true}', 'json')
check(has(json, 'attr', '"a"'), 'json: object key')
check(has(json, 'kw', 'true'), 'json: true keyword')

const bash = highlightCode('echo ${FOO:-bar} $USER', 'bash')
check(has(bash, 'var', '${FOO:-bar}'), 'bash: braced variable is one token')
check(has(bash, 'var', '$USER'), 'bash: plain variable')
check(has(bash, 'fn', 'echo'), 'bash: command name')

const sql = highlightCode('SELECT 1 -- note', 'sql')
check(has(sql, 'com', '-- note'), 'sql: dash comment')
check(has(sql, 'kw', 'SELECT'), 'sql: uppercase keyword')

const diff = highlightCode('-old line\n+new line', 'diff')
check(diff.filter(token => token.type === 'meta').length === 2, 'diff: both changed lines are meta')
check(has(diff, 'meta', '-old line'), 'diff: removed line keeps its content')
check(has(diff, 'meta', '+new line'), 'diff: added line keeps its content')

const markdownSample = highlightCode('## Title\n[site](https://example.com)', 'markdown')
check(has(markdownSample, 'meta', '##'), 'markdown: heading marker')
check(has(markdownSample, 'str', 'https://example.com'), 'markdown: link target')

const javaScriptBraces = highlightCode('if (a < b) { c = a / b }', 'javascript')
check(hasType(javaScriptBraces, 'op'), 'javascript: comparison and division stay operators')

const unterminatedString = highlightCode('const s = "abc', 'javascript')
check(join(unterminatedString) === 'const s = "abc', 'javascript: unterminated string keeps source')
check(unterminatedString.some(token => token.type === 'str' && token.text === '"abc'), 'javascript: unterminated string stays str')

const unterminatedComment = highlightCode('/* still going', 'javascript')
check(join(unterminatedComment) === '/* still going', 'javascript: unterminated comment keeps source')
check(unterminatedComment.some(token => token.type === 'com' && token.text === '/* still going'), 'javascript: unterminated comment stays com')

const pythonTriple = highlightCode('"""unterminated docstring\nstill text', 'python')
check(join(pythonTriple) === '"""unterminated docstring\nstill text', 'python: unterminated triple string keeps source')
check(hasType(pythonTriple, 'str'), 'python: unterminated triple string stays str')

check(highlightLines('a\nb').length === 2, 'highlightLines splits at newlines')
check(highlightLines('').length === 1, 'highlightLines keeps one empty row')
check(highlightLines('a\n').length === 2, 'highlightLines keeps a trailing row')

const unit = 'const value = "hello world"; // note\nfunction add(a, b) { return a + b }\n'
const large = unit.repeat(Math.ceil(200_000 / unit.length))
const started = performance.now()
const largeTokens = highlightCode(large, 'javascript')
const elapsed = performance.now() - started
check(join(largeTokens) === large, 'large block: character preservation')
check(elapsed < 1500, `large block: ${elapsed.toFixed(1)} ms is under 1500 ms`)
check(large.length >= 200_000, 'large block: generated at least 200 KB')

const cappedSource = 'x'.repeat(450 * 1024)
const capped = highlightCode(cappedSource, 'javascript')
check(join(capped) === cappedSource, 'over-cap source keeps every character')

console.log(`HIGHLIGHT_OK ${checks} checks, large block ${large.length} chars in ${elapsed.toFixed(1)} ms`)
