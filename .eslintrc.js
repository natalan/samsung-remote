module.exports = {
    "extends": [
        "airbnb-base"
    ],
    "env": {
        "node": true,
        "jest": true
    },
    "rules": {
        "no-trailing-spaces": ["error", {
            "skipBlankLines": true
        }],
        "indent": ["error", 4, {
            "VariableDeclarator": 1,
            "MemberExpression": 1
        }],
        "quotes": ["error", "double"],
        "max-len": ["error", 500],
        "comma-dangle": ["error", "never"],
        "space-before-function-paren": ["error", "never"],
        "no-unused-vars": ["error", {
            "args": "none"
        }],
        "arrow-parens": ["error", "always"],
        "func-names": 0, // Do not enforce to use named functions
        "operator-assignment": 0, // Do not enforce specific rule about operator assignment
        "no-param-reassign": 0, // Allow reassigning params. We need this at least for map and reduce
        "yoda": 0, // Do not enforce yoda rules
        "no-prototype-builtins": 0, // Allow calling Object.prototype methods directly on object instances
        "dot-notation": ["error", {"allowPattern": "^[a-z]+(_[a-z]+)+$"}],
        "global-require": 0,
        "no-new": 0,
        "no-void": 0,
        "no-bitwise": 0,
        "no-plusplus": 0, // Allow unary operator '++'
        "camelcase": 0,
        "no-mixed-operators": 0,
        "newline-per-chained-call": 0, // Don't require a newline after each call in a method chain
        "no-nested-ternary": 0,
        "no-underscore-dangle": 0, // Allow _ dangle
        "prefer-destructuring": 0,
        "prefer-rest-params": 0, // Use the rest parameters instead of 'arguments'
        
        "quote-props": ["error", "as-needed", { "keywords": true, "numbers": true }], // Unnecessarily quoted property found
        "consistent-return": 1, // Expected to return a value at the end of this function
        "no-cond-assign": 0,
        "prefer-spread": 0, // Use the spread operator instead of '.apply()'
        "eqeqeq": 1, // Expected '===' and instead saw '=='
        "guard-for-in": 0, // Temp: Wrap for-in loop into `if ({}.hasOwnProperty.call(initial, i)) {`
        "no-restricted-syntax": 0, // Do not use iterators. Prefer JavaScript's higher-order functions instead of loops like for-in or for-of
        "no-else-return": 1, // Disallow return before else,
        "no-use-before-define": 0,
        "semi-style": ["error", "last"], // Enforce location of semicolons
        
        // Enforce consistent line breaks inside braces.
        // Override base config to increase the number of minProperties in ObjectPattern (configuration for object patterns of destructuring assignments)
        "object-curly-newline": ["error", {
            ObjectExpression: { minProperties: 4, multiline: true, consistent: true },
            ObjectPattern: { minProperties: 5, multiline: true, consistent: true }
        }]
    }
};
