import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['eslint.config.mjs', 'verify.mjs'] },
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  }
)
