/** @returns {Promise<import('jest').Config>} */
module.exports = async() => ({
    verbose: true,
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"]
    },
    transformIgnorePatterns: [
        `node_modules/(?!${[
            "is-ip",
            "ip-regex",
            "is-regexp",
            "super-regex",
            "function-timeout",
            "time-span",
            "convert-hrtime",
            "clone-regexp"
        ].join("|")})`
    ]
});
