const path = require("path");

module.exports = {
  root: true,
  env: {
    node: true
  },

  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    project: path.resolve(__dirname, "./tsconfig.json"),
  }
};
