/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: '#ff7400',
                    dark: '#3A3632',
                    darker: '#3A3632',
                    input: '#333333',
                    text: '#E8D7C9',
                    muted: '#E8D7C9',
                }
            }
        },
    },
    plugins: [],
}
