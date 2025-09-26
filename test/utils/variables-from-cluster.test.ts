import { variablesFromCluster } from '../../src/utils/variables-from-cluster'
import type { Configuration } from '../../src/types/configuration'

describe('utils', () => {
  describe('variablesFromCluster', () => {
    const mockConfig: Configuration = {
      region: 'us-west-2',
      accountId: '123456789',
      project: 'test-project',
      variables: {},
      clusters: {
        'test-cluster-full': {
          environment: 'production',
          project: 'my-app',
          name: 'prod-cluster',
          region: 'us-east-1',
          targetGroups: [],
          securityGroups: ['sg-123'],
          subnets: { public: [], private: [] },
        },
        'test-cluster-minimal': {
          environment: 'development',
          region: 'us-west-2',
          targetGroups: [],
          securityGroups: ['sg-456'],
          subnets: { public: [], private: [] },
        },
        'test-cluster-no-name': {
          environment: 'staging',
          project: 'another-app',
          region: 'eu-west-1',
          targetGroups: [],
          securityGroups: ['sg-789'],
          subnets: { public: [], private: [] },
        },
      },
      tasks: {},
    }

    it('includes all fields when present', () => {
      const result = variablesFromCluster('test-cluster-full', mockConfig)

      expect(result).toEqual({
        environment: 'production',
        project: 'my-app',
        clusterName: 'prod-cluster',
        region: 'us-east-1',
      })
    })

    it('omits project when undefined', () => {
      const result = variablesFromCluster('test-cluster-minimal', mockConfig)

      expect(result).toEqual({
        environment: 'development',
        clusterName: 'test-cluster-minimal',
        region: 'us-west-2',
      })
      expect(result).not.toHaveProperty('project')
    })

    it('uses clusterKey as fallback when name is undefined', () => {
      const result = variablesFromCluster('test-cluster-no-name', mockConfig)

      expect(result).toEqual({
        environment: 'staging',
        project: 'another-app',
        clusterName: 'test-cluster-no-name',
        region: 'eu-west-1',
      })
    })

    it('throws error for non-existent cluster', () => {
      expect(() => {
        variablesFromCluster('nonexistent-cluster', mockConfig)
      }).toThrow('Could not locate variables from cluster "nonexistent-cluster"')
    })

    it('preserves all required fields', () => {
      const result = variablesFromCluster('test-cluster-full', mockConfig)

      // Verify required fields are present
      expect(result.environment).toBeDefined()
      expect(result.clusterName).toBeDefined()
      expect(result.region).toBeDefined()

      // Verify types
      expect(typeof result.environment).toBe('string')
      expect(typeof result.clusterName).toBe('string')
      expect(typeof result.region).toBe('string')
      if (result.project) {
        expect(typeof result.project).toBe('string')
      }
    })
  })
})