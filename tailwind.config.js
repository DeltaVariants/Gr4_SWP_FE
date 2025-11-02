/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/presentation/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#295E9C',  // Button background
          dark: '#1C4078',     // Button hover
          light: '#E6F4FE',    // Page background
          link: '#0062FF',     // Links and focus
          'link-hover': '#0055E0', // Link hover
        },
      },
      backgroundColor: {
        primary: '#295E9C',
        'primary-dark': '#1C4078',
        'primary-light': '#E6F4FE',
      },
      textColor: {
        primary: '#295E9C',
      },
      ringColor: {
        primary: '#295E9C',
        'primary-link': '#0062FF',
      },
      borderColor: {
        primary: '#295E9C',
        'primary-link': '#0062FF',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};