import path from 'path'
import { type Config } from 'prettier'

const workDir = path.resolve(import.meta.dirname)

export default {
  printWidth: 80,
  tabWidth: 2,
  semi: false,
  trailingComma: 'none',
  singleQuote: true,
  jsxSingleQuote: true,
  plugins: [
    path.join(
      workDir,
      'node_modules/prettier-plugin-tailwindcss/dist/index.mjs'
    )
  ]
} as Config
