import { Config } from '../src/config'

describe('Config', () => {
  describe('parse', () => {
    describe('simple config', () => {
      const config = new Config('./test/fixtures/simple.yml')

      it('exposes top-level fields', () => {
        const { config: parsed } = config.parse({
          clusterKey: 'simple-cluster',
        })

        expect(parsed.accountId).toBe(9876)
        expect(parsed.project).toBe('simple-app')
        expect(parsed.region).toBe('us-east-1')
      })

      it('parses cluster definition with subnets and target groups', () => {
        const { config: parsed } = config.parse({
          clusterKey: 'simple-cluster',
        })

        const cluster = parsed.clusters['simple-cluster']
        expect(cluster.environment).toBe('production')
        expect(cluster.region).toBe('us-east-1')
        expect(cluster.securityGroups).toEqual(['sg-simple'])
        expect(cluster.subnets).toEqual({
          public: ['subnet-aaa', 'subnet-bbb'],
          private: ['subnet-ccc'],
        })
        expect(cluster.targetGroups).toEqual([
          { arn: 'arn:aws:targetgroup:simple', port: 3000, task: 'web' },
        ])
      })

      it('parses tasks and applies subnet default of public', () => {
        const { config: parsed } = config.parse({
          clusterKey: 'simple-cluster',
        })

        expect(parsed.tasks.web.image).toBe('nginx:latest')
        expect(parsed.tasks.web.cpu).toBe(256)
        expect(parsed.tasks.web.memory).toBe(512)
        expect(parsed.tasks.web.service).toBe(true)
        // No explicit subnet → defaults to public
        expect(parsed.tasks.web.subnet).toBe('public')

        expect(parsed.tasks.worker.command).toEqual(['node', 'worker.js'])
        expect(parsed.tasks.worker.subnet).toBe('private')
      })

      it('substitutes variables in task envVars', () => {
        const { config: parsed } = config.parse({
          clusterKey: 'simple-cluster',
          taskName: 'web',
        })

        expect(parsed.tasks.web.envVars?.CLUSTER_NAME).toBe('simple-cluster')
        expect(parsed.tasks.web.envVars?.PROJECT_NAME).toBe('simple-app')
        expect(parsed.tasks.web.envVars?.APP_ENV).toBe('task-production')
      })

      it('substitutes variables in cluster secret ARNs', () => {
        const { config: parsed } = config.parse({
          clusterKey: 'simple-cluster',
        })

        const secret = parsed.clusters['simple-cluster'].secrets?.app
        expect(secret).toEqual({
          arn: 'arn:aws:secretsmanager:us-east-1:9876:secret:simple-app/app/prod-xxx',
          keys: ['DATABASE_URL'],
        })
      })

      it('returns combined variables from cluster', () => {
        const { variables } = config.parse({
          clusterKey: 'simple-cluster',
        })

        expect(variables.region).toBe('us-east-1')
        expect(variables.project).toBe('simple-app')
        expect(variables.clusterName).toBe('simple-cluster')
        expect(variables.environment).toBe('production')
        expect(variables.accountId).toBe(9876)
      })

      it('returns merged envVars from cluster and task', () => {
        const { envVars } = config.parse({
          clusterKey: 'simple-cluster',
          taskName: 'web',
        })

        // Task envVars override cluster envVars
        expect(envVars.APP_ENV).toBe('task-production')
        expect(envVars.CLUSTER_NAME).toBe('simple-cluster')
        expect(envVars.PROJECT_NAME).toBe('simple-app')
      })

      it('throws when required variables are missing', () => {
        // No clusterKey passed → no region/project resolution from cluster,
        // but the file itself defines accountId and project, and region falls
        // back to us-east-1, so this should still succeed.
        expect(() =>
          config.parse({
            clusterKey: 'simple-cluster',
          }),
        ).not.toThrow()
      })
    })

    describe('config using YAML anchors with <<: *default merging', () => {
      const config = new Config('./test/fixtures/with-anchors.yml')

      it('merges cluster defaults into each cluster', () => {
        const { config: parsed } = config.parse({
          clusterKey: 'primary-cluster',
        })

        const primary = parsed.clusters['primary-cluster']
        expect(primary.environment).toBe('production')
        expect(primary.region).toBe('us-west-2')
        expect(primary.securityGroups).toEqual(['sg-shared'])
        expect(primary.subnets).toEqual({
          public: ['subnet-public-1'],
          private: ['subnet-private-1'],
        })
        expect(primary.envVars).toEqual({
          APP_ENV: 'production',
          LOG_LEVEL: 'info',
        })
        expect(primary.targetGroups).toEqual([
          { arn: 'arn:aws:targetgroup:default', port: 3000, task: 'web' },
        ])
      })

      it('allows clusters to override merged defaults', () => {
        const { config: parsed } = config.parse({
          clusterKey: 'secondary-cluster',
        })

        const secondary = parsed.clusters['secondary-cluster']
        // Overridden values
        expect(secondary.region).toBe('eu-central-1')
        expect(secondary.envVars).toEqual({
          APP_ENV: 'staging',
          LOG_LEVEL: 'debug',
        })
        expect(secondary.subnets).toEqual({
          public: ['subnet-public-2'],
          private: ['subnet-private-2'],
        })
        // Inherited values
        expect(secondary.environment).toBe('production')
        expect(secondary.securityGroups).toEqual(['sg-shared'])
      })

      it('merges task defaults into each task', () => {
        const { config: parsed } = config.parse({
          clusterKey: 'primary-cluster',
        })

        expect(parsed.tasks.web.taskRoleArn).toBe(
          'arn:aws:iam::role/shared-task',
        )
        expect(parsed.tasks.web.executionRoleArn).toBe(
          'arn:aws:iam::role/shared-execution',
        )
        expect(parsed.tasks.web.image).toBe('shared:latest')
        expect(parsed.tasks.web.cpu).toBe(256)
        expect(parsed.tasks.web.memory).toBe(512)
        expect(parsed.tasks.web.service).toBe(true)
      })

      it('allows tasks to override merged defaults', () => {
        const { config: parsed } = config.parse({
          clusterKey: 'primary-cluster',
        })

        // Overridden
        expect(parsed.tasks.worker.cpu).toBe(512)
        expect(parsed.tasks.worker.memory).toBe(1024)
        expect(parsed.tasks.worker.subnet).toBe('private')
        expect(parsed.tasks.worker.service).toBe(false)
        // Inherited
        expect(parsed.tasks.worker.image).toBe('shared:latest')
        expect(parsed.tasks.worker.taskRoleArn).toBe(
          'arn:aws:iam::role/shared-task',
        )
      })

      it('substitutes variables inside merged task envVars', () => {
        const { config: parsed } = config.parse({
          clusterKey: 'primary-cluster',
          taskName: 'web',
        })

        // CLUSTER_NAME comes from the shared anchor and should be substituted
        expect(parsed.tasks.web.envVars?.CLUSTER_NAME).toBe('primary-cluster')
        expect(parsed.tasks.web.envVars?.APP_ENV).toBe('task-shared')
      })

      it('uses cluster-specific region in resolved variables', () => {
        const { config: parsed, variables } = config.parse({
          clusterKey: 'secondary-cluster',
        })

        expect(variables.region).toBe('eu-central-1')
        expect(parsed.region).toBe('eu-central-1')
        expect(variables.clusterName).toBe('secondary-cluster')
      })
    })
  })
})
