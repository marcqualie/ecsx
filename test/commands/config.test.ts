import { expect, test } from '@oclif/test'

describe('command', () => {
  describe('config', () => {
    test
    .stdout()
    .command(['config'])
    .it('sets the correct region', ctx => {
      expect(ctx.stdout).to.contain('"region": "eu-central-1",')
    })
  })
})
