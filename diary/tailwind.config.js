// Tailwind settings for the smart diary (diary/index.html → diary/diary.css).
// Rebuild after changing any class in index.html:
//   npx --yes tailwindcss@3.4.17 -c diary/tailwind.config.js -i diary/diary.input.css -o diary/diary.css --minify
// Colours follow the Paperloop website (assets/css/khata.css): navy #14213d, gold #d9ae5a / #b8892f,
// paper #fffdf8 on #f7f3e9.
module.exports = {
  content: ['./diary/index.html'],
  theme: {
    extend: {
      colors: {
        white: '#fffdf8',   // Paperloop "surface": cards are paper, not pure white
        ink: {              // navy neutrals (text, borders, dark buttons)
          50: '#fbf8f0',
          100: '#f3eddf',
          200: '#e0d9c5',
          300: '#cfc6ad',
          400: '#a3a9bb',
          500: '#5f6984',
          600: '#525d78',
          700: '#3a4766',
          800: '#22335c',
          900: '#14213d',
          950: '#0d1629'
        },
        gold: {             // the accent: active tiles, alerts, highlights
          50: '#fbf3e2',
          100: '#f6e6c4',
          200: '#ecd29c',
          300: '#e2bf78',
          400: '#d9ae5a',
          500: '#c99a40',
          600: '#b8892f',
          700: '#94691c',
          800: '#765212',
          900: '#5c400c',
          950: '#3d2a06'
        }
      },
      fontFamily: {
        sans: ['"Noto Sans Bengali"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Baloo Da 2"', '"Noto Sans Bengali"', 'Inter', 'system-ui', 'sans-serif']
      }
    }
  }
};
