/**@type {import('eslint').Linter.Config} */
// Useful references:
// https://www.npmjs.com/package/eslint-config-react-app
// https://github.com/facebook/create-react-app/blob/master/packages/eslint-config-react-app/index.js
// https://medium.com/@dors718/linting-your-react-typescript-project-with-eslint-and-prettier-2423170c3d42

// to run it from a shell
// npm run lint

// eslint-disable-next-line no-undef
const path = require('path');
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
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
        'prettier', // Disable ESLint rules if their redundant with a prettier error 
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
        semi: [2, 'always'],
        '@typescript-eslint/no-unused-vars': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,
        '@typescript-eslint/no-non-null-assertion': 0,

        // let's alter rules from the recommendations above
        // turn off ones that typescript does a better job at
        'no-undef': 'off',
        'no-redeclare': 'off',

        // won't let you do myList.reduce(Util512.add)
        '@typescript-eslint/unbound-method': 'off',

        // don't needlessly have a call() or apply()
        'no-useless-call': 'warn', 

        // apply is dangerous, there could be max arg limits. see also the ban/ban
        'prefer-spread': 'warn', 

        // personal preference, ones that I think are fine
        'no-inner-declarations': 'off',
        'no-prototype-builtins': 'off',
        'no-debugger': 'off',
        'no-constant-condition': 'off',
        'prefer-const': 'off',
        'prefer-destructuring': 'off',
        'no-empty': 'off',

        // typescript, ones that I think are fine
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/class-name-casing': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/prefer-regexp-exec': 'off',
        '@typescript-eslint/promise-function-async': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',

        // for now I think it's fine to allow some implicit anys, like it's ok to return `any` from a fn
        // or call a method on an `any` object since the `any` already indicates this is unsafe.
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',

        // leaving disabled, since default vals in classes seem to work fine
        'no-invalid-this': 'off',

        // we want let s1 || 'default' to be an error, s1 ?? 'default' is better
        // should I enable strict-boolean-expressions to detect this? 
        // no, causes false positives for code like if (str1) {...} which I think is ok.
        // so I've written my own || check, which runs when you run `npm run prettierexceptlongimports`
        '@typescript-eslint/prefer-nullish-coalescing': ["error", { 
            ignoreConditionalTests: false,
            ignoreMixedLogicalExpressions: false,
            forceSuggestionFixer: false,
          },],

        // went through all non-default ones, chose to turn these on
        'curly': 'warn',
        'eqeqeq': 'warn',
        'no-template-curly-in-string': 'warn',
        'block-scoped-var': 'warn',
        'default-case': 'warn',
        'default-param-last': 'warn',
        'guard-for-in': 'warn',
        'no-caller': 'warn',
        'no-constructor-return': 'warn',
        'no-eval': 'warn',
        'no-extend-native': 'warn',
        'no-extra-bind': 'warn',
        'no-extra-label': 'warn',
        'no-floating-decimal': 'warn',
        'no-implicit-coercion': 'warn',
        'no-implied-eval': 'warn',
        'no-labels': 'warn',
        'no-loop-func': 'warn',
        'no-new-func': 'warn',
        'no-new-wrappers': 'warn',
        'no-octal-escape': 'warn',
        'no-return-assign': 'warn',
        'no-return-await': 'warn',
        'no-self-compare': 'warn',
        'no-sequences': 'warn',
        'no-throw-literal': 'warn',
        'no-unused-expressions': 'warn',
        'wrap-iife': 'warn',
        'no-array-constructor': 'warn',
        'no-multi-assign': 'warn',
        'no-tabs': 'warn',
        'no-var': 'warn',
        'prefer-rest-params': 'warn',

        // after v6.8
        'no-useless-backreference': 'error',
        'default-case-last': 'error',
        'no-unreachable-loop': 'error',
        'no-promise-executor-return': 'error',
        'no-unsafe-optional-chaining': 'error',

        // unfortunately incompatible with prettier, see .prettier.js for more
        'no-mixed-operators': 'off',

        // went through all non-default ts ones, chose to turn these on
        '@typescript-eslint/no-extra-non-null-assertion': 'warn',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-implied-eval': 'warn',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
        '@typescript-eslint/no-throw-literal': 'warn',
        '@typescript-eslint/require-array-sort-compare': 'warn', 
        
        // a few other ones
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/consistent-type-imports': {prefer: 'type-imports'},
        
        // after 2.26.0
        '@typescript-eslint/non-nullable-type-assertion-style': 'warn', 
        '@typescript-eslint/no-confusing-void-expression': 'warn', 
        '@typescript-eslint/consistent-indexed-object-style': 'error', 
        '@typescript-eslint/no-implicit-any-catch': 'off', 
        '@typescript-eslint/prefer-reduce-type-parameter': 'error', 
        '@typescript-eslint/prefer-ts-expect-error': 'error', 
        "no-duplicate-imports": "off", // turn off eslint's in favor of the ts version
        "@typescript-eslint/no-duplicate-imports": ["error"],
        "comma-dangle": "off", // turn off eslint's in favor of the ts version
        "@typescript-eslint/comma-dangle": ["error"],
        "no-loop-func": "off", // turn off eslint's in favor of the ts version
        "@typescript-eslint/no-loop-func": ["error"],
        "no-loss-of-precision": "off", // turn off eslint's in favor of the ts version
        "@typescript-eslint/no-loss-of-precision": ["error"],
        
        // after eslint7.32.0 + eslint-ts4.29.3
        'no-constant-binary-expression': 'error',
        'no-unused-private-class-members': 'error',
        'prefer-object-has-own': 'off',
        '@typescript-eslint/consistent-generic-constructors': 'error',
        '@typescript-eslint/no-unsafe-declaration-merging': 'error',
        '@typescript-eslint/no-duplicate-enum-values': 'error',
        '@typescript-eslint/no-unsafe-enum-comparison': 'error',
        '@typescript-eslint/no-unsafe-enum-asssignment': 'error',

        // checks locals, not fn params.
        // annoying to leave this on while editing, so we'll use typescript 6133 instead
        // and leave typescript warning 6133 on only when building for production
        '@typescript-eslint/no-unused-vars': 'off', 

        // don't need `radix` due to ban below
        // don't need `prefer-for-of`, in some cases I want the slightly-faster for in
        // don't need `no-duplicate-super`, no longer seen
        // no-param-reassign might be useful one day
        // id-blacklist might be useful one day

        "ban/ban": [
            1, // warn
            {"name": "parseInt", "message": "prefer my parseint in utils, don't need to remember to specify base10."},
            {"name": ["*", "setTimeout"], "message": "use syncToAsyncAfterPause instead or exceptions won't get logged."},
            {"name": "setTimeout", "message": "use syncToAsyncAfterPause instead or exceptions won't get logged."},
            {"name": ["*", "setInterval"], "message": "use syncToAsyncAfterPause instead or exceptions won't get logged."},
            {"name": "setInterval", "message": "use syncToAsyncAfterPause instead or exceptions won't get logged."},
            {"name": ["*", "substr"], "message": "substr is deprecated."},
        ]
    }
};
