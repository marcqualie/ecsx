process.env.ECSX_CONFIG_PATH = './test/ecsx.yml'

import { describe } from 'mocha'
import { expect } from 'chai'

import { secretsFromConfiguration } from '../../src/ecs/task-definition'
import { configWithVariables } from '../../src/utils/config-with-variables'

describe('ecs', () => {
  describe('task-definition', () => {
    describe('secretsFromConfiguration', () => {
      it('translate secrets to task definition format', () => {
        const { config } = configWithVariables({ clusterName: 'ecsx-test-cluster' })
        const output = secretsFromConfiguration('mocha', 'ecsx-test-cluster', config)
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
    })
  })
})
