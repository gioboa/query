import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'react-query-devtools',
    dir: './src',
    watch: false,
    setupFiles: ['test-setup.ts'],
    environment: 'jsdom',
    globals: true,
    coverage: { provider: 'istanbul' },
  },
})
