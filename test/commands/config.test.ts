import Config from '../../src/commands/config'

describe('command', () => {
  describe('config', () => {
    it('sets the correct region', async () => {
      // Mock the log method to capture output
      const logs: string[] = []
      const config = new Config(['-c', 'ecsx-test-cluster'], {} as any)
      const originalLog = config.log
      config.log = (...args: any[]) => {
        logs.push(args.join(' '))
      }

      await config.run()
      const output = logs.join('\n')
      expect(output).toContain('"region": "us-east-1",')
    }, 5000)
  })
})
