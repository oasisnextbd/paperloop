// Tailwind settings for the smart diary (diary/index.html → diary/diary.css).
// Rebuild after changing any class in index.html:
//   npx --yes tailwindcss@3.4.17 -c diary/tailwind.config.js -i diary/diary.input.css -o diary/diary.css --minify
// Colours follow the Paperloop website (assets/css/khata.css): navy #14213d, gold #d9ae5a / #b8892f,
// paper #fffdf8 on #f7f3e9. They are CSS variables (defaults in diary.input.css → :root) so that a school
// can give the app its own colours (SCHOOL DESIGN → অ্যাপের রং in index.html); the hex values below are
// the defaults and are repeated there.
module.exports = {
  content: ['./diary/index.html'],
  theme: {
    extend: {
      colors: {
        white: 'rgb(var(--paper) / <alpha-value>)',   // Paperloop "surface" #fffdf8: cards are paper, not pure white
        ink: {              // navy neutrals (text, borders, dark buttons)
          50: 'rgb(var(--ink-50) / <alpha-value>)',   // #fbf8f0
          100: 'rgb(var(--ink-100) / <alpha-value>)',   // #f3eddf
          200: 'rgb(var(--ink-200) / <alpha-value>)',   // #e0d9c5
          300: 'rgb(var(--ink-300) / <alpha-value>)',   // #cfc6ad
          400: 'rgb(var(--ink-400) / <alpha-value>)',   // #a3a9bb
          500: 'rgb(var(--ink-500) / <alpha-value>)',   // #5f6984
          600: 'rgb(var(--ink-600) / <alpha-value>)',   // #525d78
          700: 'rgb(var(--ink-700) / <alpha-value>)',   // #3a4766
          800: 'rgb(var(--ink-800) / <alpha-value>)',   // #22335c
          900: 'rgb(var(--ink-900) / <alpha-value>)',   // #14213d
          950: 'rgb(var(--ink-950) / <alpha-value>)'   // #0d1629
        },
        gold: {             // the accent: active tiles, alerts, highlights
          50: 'rgb(var(--gold-50) / <alpha-value>)',   // #fbf3e2
          100: 'rgb(var(--gold-100) / <alpha-value>)',   // #f6e6c4
          200: 'rgb(var(--gold-200) / <alpha-value>)',   // #ecd29c
          300: 'rgb(var(--gold-300) / <alpha-value>)',   // #e2bf78
          400: 'rgb(var(--gold-400) / <alpha-value>)',   // #d9ae5a
          500: 'rgb(var(--gold-500) / <alpha-value>)',   // #c99a40
          600: 'rgb(var(--gold-600) / <alpha-value>)',   // #b8892f
          700: 'rgb(var(--gold-700) / <alpha-value>)',   // #94691c
          800: 'rgb(var(--gold-800) / <alpha-value>)',   // #765212
          900: 'rgb(var(--gold-900) / <alpha-value>)',   // #5c400c
          950: 'rgb(var(--gold-950) / <alpha-value>)'   // #3d2a06
        }
      },
      fontFamily: {
        sans: ['"Noto Sans Bengali"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Baloo Da 2"', '"Noto Sans Bengali"', 'Inter', 'system-ui', 'sans-serif']
      }
    }
  }
};
