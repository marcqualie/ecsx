import { describe } from 'mocha'
import { expect } from 'chai'

import { Configuration } from '../../src/types/configuration'
import { secretsFromConfiguration } from '../../src/ecs/task-definition'

const mockConfig: Configuration = {
  version: '0.1',
  region: 'us-east-1',
  accountId: 'act-xxx',
  project: 'test',
  variables: {},
  clusters: {
    test: {
      secrets: {
        app: 'arn:123:app/test-xxx',
      },
      targetGroups: [],
      securityGroups: [],
      publicSubnets: [],
      privateSubnets: [],
    },
  },
  tasks: {
    mocha: {
      image: '',
      command: [],
      cpu: 256,
      memory: 512,
      environment: {},
      executionRoleArn: 'role-1',
      secrets: [
        {
          name: 'app',
          keys: [
            'NODE_ENV',
            'SOME_VAR',
          ],
        },
      ],
    },
  },
}

describe('ecs', () => {
  describe('task-definition', () => {
    describe('secretsFromConfiguration', () => {
      it('translate secrets to task definition format', () => {
        const output = secretsFromConfiguration('mocha', 'test', mockConfig)
        expect(output).to.deep.equal([
          {
            name: 'NODE_ENV',
            valueFrom: 'arn:123:app/test-xxx:NODE_ENV::',
          },
          {
            name: 'SOME_VAR',
            valueFrom: 'arn:123:app/test-xxx:SOME_VAR::',
          },
        ])
      })
    })
  })
})
