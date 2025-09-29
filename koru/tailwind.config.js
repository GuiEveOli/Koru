/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'principal': '#3490dc', // Um azul, por exemplo
        'texto-botao': '#ffffff', // Branco
        'borda-botao': '#2779bd', // Um azul mais escuro
      },
    },
  },
  plugins: [],
}