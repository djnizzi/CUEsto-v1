/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: '#ff7400',
                    dark: 'var(--color-brand-dark)',
                    darker: 'var(--color-brand-darker)',
                    input: 'var(--color-brand-input)',
                    text: 'var(--color-brand-text)',
                    muted: 'var(--color-brand-muted)',
                    'input-border': 'var(--color-brand-input-border)',
                }
            }
        },
    },
    plugins: [],
}
