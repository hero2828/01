import antfu from '@antfu/eslint-config'
import format from 'eslint-plugin-format'

export default antfu({
  // ts规则
  files: ['./src/**/*.ts'],
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false
  },
  rules: {
    'no-console': 'off',
    'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 1 }]
  },
}, {
  // scss规则
  files: ['./src/**/*.scss'],
  languageOptions: {
    parser: format.parserPlain,
  },
  plugins: {
    format,
  },
  rules: {
    'format/prettier': ['error', { parser: 'scss', tabWidth: 2 }],
  },
}, {
  files: ['./src/**/*.md'],
  rules: {
    'style/no-tabs': 'off',
  },
})
