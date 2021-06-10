process.env.ECSX_CONFIG_PATH = './test/ecsx.yml'

import { describe } from 'mocha'
import { expect } from 'chai'

import { configWithVariables } from '../src/utils/config-with-variables'
import { eq } from 'lodash'

describe('ecs', () => {
  describe('utils', () => {
    describe('configWithVariables', () => {
      it('parses raw config', () => {
        const { config } = configWithVariables({ clusterName: 'ecsx-test-cluster', taskName: 'mocha' })

        expect(config.region).to.equal('us-east-1')
        expect(config.accountId).to.equal(1234)

        expect(config.clusters['ecsx-test-cluster'].subnets).to.deep.equal(['subnet-1'])
        expect(config.tasks.mocha.subnets).to.deep.equal(['subnet-2'])

        // Verify that variables are processed out
        expect(config.tasks.mocha.envVars?.CLUSTER_NAME).to.equal('ecsx-test-cluster')
      })
    })
  })
})
