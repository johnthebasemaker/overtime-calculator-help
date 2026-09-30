# Overtime Calculator help

Tutorial videos for the Overtime Calculator Android app, and the small site
that plays them: **https://johnthebasemaker.github.io/overtime-calculator-help/**

| Video | Page | Length |
|---|---|---|
| Using Overtime Calculator | `docs/manual.html` (chapters: `#t=8.2`, `48.2`, `61.3`, `91`, `114.7`) | 2:21 |
| Import your attendance | `docs/import.html` | 1:07 |

The app's "Watch how" links open these pages. `manual.html#t=<seconds>` starts
the manual at a chapter.

## Nothing here is real

Every screen is invented: the attendance portal is redrawn from
`tools/report-data.mjs` (August 2026, "Worker name", code 00000), and the app
screens are captured from the app with a made-up salary of 2,000 + 400. No
company, logo, worker, code or real time appears anywhere.

## How the videos are made

They are [HyperFrames](https://hyperframes.heygen.com) compositions, written by
a script from the captures and the narration's real timings.

```bash
npm install
node tools/portal.mjs            # the redrawn portal -> shared/portal.html
node tools/capture.mjs           # screens (needs the app's dev server on :8080)
node tools/capture-manual.mjs    # the manual's extra screens
cd videos/import-attendance && node build.mjs && npx hyperframes@0.8.96 check
npx hyperframes@0.8.96 render -o renders/import-attendance.mp4 --fps 30 --crf 24
```

Each video folder holds its storyboard (`STORYBOARD.md`, `storyboard.html`),
its look (`frame.md`), the narration (`assets/voice`, generated with Kokoro,
voice `am_michael`) and `build.mjs`. Copy a finished render to `docs/media/`
to publish it.
