import { expect, test } from '@oclif/test'

describe('command', () => {
  describe('config', () => {
    test
    .stdout()
    .command(['config', '-c', 'ecsx-test-cluster'])
    .it('sets the correct region', function (ctx) {
      this.timeout(5000)

      expect(ctx.stdout).to.contain('"region": "us-east-1",')
    })
  })
})
