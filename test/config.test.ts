
import { configWithVariables } from '../src/utils/config-with-variables'

describe('ecs', () => {
  describe('utils', () => {
    describe('configWithVariables', () => {
      it('parses raw config', () => {
        const { config, variables } = configWithVariables({ clusterKey: 'ecsx-test-cluster', taskName: 'mocha' })

        expect(config.region).toBe('us-east-1')
        expect(variables.region).toBe('us-east-1')
        expect(config.accountId).toBe(1234)

        expect(config.clusters['ecsx-test-cluster'].subnets).toEqual({ public: ['subnet-1'], private: [] })
        expect(config.tasks.web.subnet).toBe('public')
        expect(config.tasks.mocha.subnet).toBe('private')

        // Verify that variables are processed out
        expect(config.tasks.mocha.envVars?.CLUSTER_NAME).toBe('ecsx-test-cluster')
      })
    })
  })
})
