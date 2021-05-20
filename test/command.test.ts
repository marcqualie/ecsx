process.env.ECSX_CONFIG_PATH = './test/ecsx.yml'

import { describe } from 'mocha'
import { expect } from 'chai'

import { configWithVariables } from '../src/utils/config-with-variables'

describe('ecs', () => {
  describe('utils', () => {
    describe('configWithVariables', () => {
      it('translate secrets to task definition format', () => {
        const { variables } = configWithVariables({ clusterName: 'ecsx-test-cluster' })
        expect(variables).to.deep.equal({
          clusterName: 'ecsx-test-cluster',
          environment: 'test',
          project: 'ecsx',
          region: 'us-east-1',
          accountId: 1234,
        })
      })
    })
  })
})
