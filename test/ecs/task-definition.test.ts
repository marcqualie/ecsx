process.env.ECSX_CONFIG_PATH = './test/ecsx.yml'

import { describe } from 'mocha'
import { expect } from 'chai'

import { secretsFromConfiguration } from '../../src/ecs/task-definition'
import { configWithVariables } from '../../src/utils/config-with-variables'

describe('ecs', () => {
  describe('task-definition', () => {
    describe('secretsFromConfiguration', () => {
      it('translate secrets to task definition format', () => {
        const { config, variables: { region } } = configWithVariables({ clusterKey: 'ecsx-test-cluster' })
        const output = secretsFromConfiguration('mocha', 'ecsx-test-cluster', config, region)
        expect(output).to.deep.equal([
          {
            name: 'CLUSTER_KEY_1',
            valueFrom: 'arn:aws:secretsmanager:us-east-1:1234:secret:ecsx/app/test-xxx:CLUSTER_KEY_1::',
          },
          {
            name: 'NODE_ENV',
            valueFrom: 'arn:aws:secretsmanager:us-east-1:1234:secret:ecsx/app/test-xxx:NODE_ENV::',
          },
          {
            name: 'SOME_VAR',
            valueFrom: 'arn:aws:secretsmanager:us-east-1:1234:secret:ecsx/app/test-xxx:SOME_VAR::',
          },
          {
            name: 'X_CLUSTER_KEY_2',
            valueFrom: 'arn:aws:secretsmanager:us-east-1:1234:secret:ecsx/app/test-xxx:X_CLUSTER_KEY_2::',
          },
        ])
      })

      it('translate service only secrets to task definition format', () => {
        const { config, variables: { region } } = configWithVariables({ clusterKey: 'ecsx-test-cluster-with-string-secrets', region: 'eu-central-1' })
        const output = secretsFromConfiguration('mocha', 'ecsx-test-cluster-with-string-secrets', config, region)
        expect(output).to.deep.equal([
          {
            name: 'NODE_ENV',
            valueFrom: 'arn:aws:secretsmanager:eu-central-1:1234:secret:ecsx/app/test-xxx:NODE_ENV::',
          },
          {
            name: 'SOME_VAR',
            valueFrom: 'arn:aws:secretsmanager:eu-central-1:1234:secret:ecsx/app/test-xxx:SOME_VAR::',
          },
        ])
      })

      it('translate cluster only secrets to task definition format', () => {
        const { config, variables: { region } } = configWithVariables({ clusterKey: 'ecsx-test-cluster' })
        const output = secretsFromConfiguration('has-no-secrets', 'ecsx-test-cluster', config, region)
        expect(output).to.deep.equal([
          {
            name: 'CLUSTER_KEY_1',
            valueFrom: 'arn:aws:secretsmanager:us-east-1:1234:secret:ecsx/app/test-xxx:CLUSTER_KEY_1::',
          },
          {
            name: 'X_CLUSTER_KEY_2',
            valueFrom: 'arn:aws:secretsmanager:us-east-1:1234:secret:ecsx/app/test-xxx:X_CLUSTER_KEY_2::',
          },
        ])
      })
    })
  })
})
