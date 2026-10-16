// Configuração do ESLint para o CineLog mobile.
const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');

module.exports = defineConfig([
    expo,
    {
        ignores: ['dist/**', '.expo/**'],
    },
    {
        files: ['**/*.js', '**/*.jsx'],
        rules: {
            'indent': ['error', 4],
            'curly': 'error',
            'no-trailing-spaces': 'error',
        },
    },
]);
