import type { UserConfig } from 'vitest/config'

const config: UserConfig = {
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: ['**/__tests__/**/*.test.{ts,tsx}']
  }
}

export default config