import type { UserConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

const config: UserConfig = {
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['**/__tests__/**/*.test.{ts,tsx}']
  }
}

export default config