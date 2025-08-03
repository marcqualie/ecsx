import { runCommand } from '@oclif/test'

describe('command', () => {
  describe('config', () => {
    it('sets the correct region', async () => {
      const { stdout } = await runCommand('config -c ecsx-test-cluster')
      expect(stdout).toContain('"region": "us-east-1",')
    }, 5000)
  })
})
