# Long-chat performance harness

Opt-in, zero-dependency measurement tools for the long-chat input investigation.
They are **not** part of `node --test`: they start a real DSH Web UI, drive a real
Chromium over the DevTools Protocol, and need roughly 10–20 seconds per suite.

Everything here uses Node built-ins and the Chrome/Edge already installed on the
machine. No npm package is installed.

## What it does

- `page-harness.js` builds synthetic conversations (10/50/100/300/500 rows, a
  dense Markdown variant, and a 300-row streaming variant), seeds them into the
  plugin's real store, and records per-input latency plus component render counts.
- `run-suite.mjs` drives Chromium through `cdp.mjs`, types real key events and
  writes a result JSON (`run-suite.mjs <url> <label> <output.json> [sizes]`).
- `instrument-client.mjs` injects the same render counters into a built
  `client.js` for both baseline and fixed runs. The shipped bundle stays clean.
- `summarize.mjs` / `print-summary.mjs` turn the raw result into the table used in
  `docs/perf/long-chat-performance.md`.
- `measure-mount.mjs` measures seed-to-rendered time for the mount comparison.
- `make-profile.ps1` creates an isolated DSH profile whose
  `@local/deepseek-chat-mode` resolves to one bundle directory, by junctioning the
  installed profile's packages. The desktop profile itself is never edited.

## Setup (Windows, one test profile per bundle)

1. Build the bundle under test: `node tools/build-client.js`.
2. Copy the package files into a test directory, then run
   `node tools/perf/instrument-client.mjs <dir>/client.js <dir>/client.js baseline`
   (use `fixed` for the other side).
3. Create a private home, e.g. `.tmp/perf-home`, and a profile:
   `powershell -File tools/perf/make-profile.ps1 -Name bench -BundleDir <dir> -PerfHome <home>`.
4. Boot the UI without opening a browser:
   `set DSH_HOME=<home>` and run
   `<DSH install>\resources\runtime\cli\bin\dsh.cmd --profile bench --no-open --port 56001`.
5. Copy the printed URL (it contains a one-time token) and run the suite.
6. Stop the server and delete `.tmp` when finished.

## Notes

- Synthetic data only. The harness never reads or writes real chat records; the
  test home starts empty.
- Chrome/Edge is launched with a throwaway `--user-data-dir`; the first-run
  Preview Notice is dismissed inside that throwaway page only.
- Latency is measured from the `input` event timestamp to the post-frame task,
  which includes paint and a timer margin. See the report for the exact metric.
- Headless Chromium is not Electron. Same machine/browser/data before/after is
  the comparison; absolute numbers should be re-checked in the desktop window.
