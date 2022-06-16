process.env.ECSX_CONFIG_PATH = './test/ecsx.yml'

import { describe } from 'mocha'
import { expect } from 'chai'

import { configWithVariables } from '../src/utils/config-with-variables'

describe('ecs', () => {
  describe('utils', () => {
    describe('configWithVariables', () => {
      it('translates cluster level variables into key/value format', () => {
        const { variables, envVars } = configWithVariables({ clusterKey: 'ecsx-test-cluster' })
        expect(variables).to.deep.equal({
          clusterKey: 'ecsx-test-cluster',
          clusterName: 'ecsx-test-cluster',
          environment: 'test',
          project: 'ecsx',
          region: 'us-east-1',
          accountId: 1234,
        })

        expect(envVars).to.deep.equal({
          CLUSTER_ENV: 'test',
          APP_ENV: 'test',
        })
      })

      it('translates cluster + task level env vars into key/value format', () => {
        const { variables, envVars } = configWithVariables({ clusterKey: 'ecsx-test-cluster', taskName: 'mocha' })
        expect(variables).to.deep.equal({
          clusterName: 'ecsx-test-cluster',
          clusterKey: 'ecsx-test-cluster',
          environment: 'test',
          project: 'ecsx',
          region: 'us-east-1',
          accountId: 1234,
          taskName: 'mocha',
        })

        expect(envVars).to.deep.equal({
          CLUSTER_ENV: 'test',
          CLUSTER_NAME: 'ecsx-test-cluster',
          APP_ENV: 'task-test',
        })
      })
    })
  })
})
