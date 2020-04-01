// Useful references:
// https://www.npmjs.com/package/eslint-config-react-app
// https://github.com/facebook/create-react-app/blob/master/packages/eslint-config-react-app/index.js
// https://medium.com/@dors718/linting-your-react-typescript-project-with-eslint-and-prettier-2423170c3d42

// to run it from a shell
// node ..\node_modules\eslint\bin\eslint.js -c ..\.eslintrc.js *.ts

const path = require('path');
module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    plugins: [
        '@typescript-eslint',
        'ban',
        // not 'prettier', we don't run prettier through eslint as it's slow
        // to run prettier, instead run `npm run prettierexceptlongimports`
    ],
    env: {
        browser: true,
        jest: true
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'plugin:@typescript-eslint/recommended-requiring-type-checking', // You need both to actually get the defaults
        'prettier/@typescript-eslint', // Disable ESLint rules if their redundant with a prettier error 
        // 'plugin:prettier/recommended' // Displays prettier errors as ESLint errors. (must be last)
    ],
    parserOptions: {
        project: path.resolve(__dirname, './tsconfig.json'),
        tsconfigRootDir: __dirname,
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        ecmaFeatures: {
            jsx: true // Allows for the parsing of JSX
        }
    },
    rules: {
        // Place to specify ESLint rules.
        // Can be used to overwrite rules specified from the extended configs
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/class-name-casing': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-unused-vars': 'off', // check locals, not fn params. typescript 6133 takes care of it
        '@typescript-eslint/prefer-nullish-coalescing': ["error", { // still doesn't catch en.attrs['AC'] || ''; for some reason
            ignoreConditionalTests: false,
            ignoreMixedLogicalExpressions: false,
            forceSuggestionFixer: false,
          },],
        'no-useless-call': 'warn', // don't needlessly have a call() or apply()
        'prefer-spread': 'warn', // apply is dangerous, there could be max arg limits. won't catch everything, so I added ban/ban
        'prefer-const': 'off',
        'eqeqeq': 'warn',
        "ban/ban": [
            1, // warn
            {"name": ["*", "apply"], "message": "apply is dangerous, there could be max arg limits."}
        ]
    },
    settings: {
    }
};
