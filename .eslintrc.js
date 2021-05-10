module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    browser: true,
  },
  globals: {
    BMap: true,
    WasmPlayer: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-prototype-builtins': 'off',
    'no-unused-vars': 'off',
  },
};
