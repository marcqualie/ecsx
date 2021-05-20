import { expect, test } from '@oclif/test'

describe('command', () => {
  describe('config', () => {
    test
    .stdout()
    .command(['config', '-c', 'ecsx-test-cluster'])
    .it('sets the correct region', ctx => {
      expect(ctx.stdout).to.contain('"region": "us-east-1",')
    })
  })
})
