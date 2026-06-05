const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearInterval: "readonly",
        setInterval: "readonly",
        Promise: "readonly",
        Buffer: "readonly",
        global: "readonly",
        URL: "readonly",
        TextDecoder: "readonly"
      }
    },
    rules: {
      "no-unused-vars": ["warn", { "args": "none", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
      "no-console": "off",
      "preserve-caught-error": "off"
    }
  },
  {
    ignores: ["node_modules/**", "examples/enterprise-preview/**"]
  }
];
