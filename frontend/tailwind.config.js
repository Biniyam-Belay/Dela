// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
    content: [ /* ... */ ],
    theme: {
      extend: { // Ensure it's inside extend
        colors: {
          'accent': { /* ... */ },
          // Make sure the key is 'background' and the value is a valid color string
          'background': '#F8F7F5', // Or your chosen color
        }
      },
    },
    plugins: [],
  }