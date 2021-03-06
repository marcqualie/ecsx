process.env.ECSX_CONFIG_PATH = './test/ecsx.yml'

import { describe } from 'mocha'
import { expect } from 'chai'

import { configWithVariables } from '../src/utils/config-with-variables'
import { eq } from 'lodash'

describe('ecs', () => {
  describe('utils', () => {
    describe('configWithVariables', () => {
      it('parses raw config', () => {
        const { config, variables } = configWithVariables({ clusterKey: 'ecsx-test-cluster', taskName: 'mocha' })

        expect(config.region).to.equal('us-east-1')
        expect(variables.region).to.equal('us-east-1')
        expect(config.accountId).to.equal(1234)

        expect(config.clusters['ecsx-test-cluster'].subnets).to.deep.equal({ public: ['subnet-1'], private: [] })
        expect(config.tasks.web.subnet).to.deep.equal('public')
        expect(config.tasks.mocha.subnet).to.deep.equal('private')

        // Verify that variables are processed out
        expect(config.tasks.mocha.envVars?.CLUSTER_NAME).to.equal('ecsx-test-cluster')
      })
    })
  })
})
