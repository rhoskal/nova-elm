module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  plugins: ["prettier", "@typescript-eslint", "import"],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      1,
      {
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],
    "import/newline-after-import": 2,
    "import/no-cycle": 2,
    "import/no-relative-parent-imports": 2,
    "prettier/prettier": "error",
  },
};
