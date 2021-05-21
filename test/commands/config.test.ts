import { expect, test } from '@oclif/test'

describe('command', () => {
  describe('config', () => {
    test
    .timeout(5000)
    .stdout()
    .command(['config', '-c', 'ecsx-test-cluster'])
    .it('sets the correct region', async function (ctx) {
      expect(ctx.stdout).to.contain('"region": "us-east-1",')
    })
  })
})
