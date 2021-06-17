import { Container } from '@aws-sdk/client-ecs'
import { flags } from '@oclif/command'
import { config } from 'process'
import { AwsCommand } from '../command'

export default class PsCommand extends AwsCommand {
  static description = 'Show running services within a cluster'

  static flags = {
    help: flags.help({
      char: 'h',
    }),
    clusterName: flags.string({
      char: 'c',
      required: true,
    }),
  }

  async run() {
    const { flags: { clusterName } } = this.parse(PsCommand)
    const client = this.ecs_client()
    const { config, variables: { environment, project } } = this.configWithVariables({
      clusterName,
    })

    // Common patterns we can ignore
    const taskArnPrefix = `arn:aws:ecs:${config.region}:${config.accountId}:task/${project}-${environment}/`
    const ecrRepoPrefix = `${config.accountId}.dkr.ecr.${config.region}.amazonaws.com/${project}:`

    // Find tasks within cluster
    const { taskArns } = await client.listTasks({
      cluster: clusterName,
    })
    const { tasks: existingTasks = [] } = await client.describeTasks({
      cluster: clusterName,
      tasks: taskArns,
    })

    // Find services within cluster
    const { services: existingServices = [] } = await client.describeServices({
      cluster: clusterName,
      services: Object.keys(config.tasks).filter(task => !task.startsWith('$')),
    })
    for (const service of existingServices) {
      const containerPort = service.loadBalancers && service.loadBalancers[0] ? `https=${service.loadBalancers[0].containerPort}` : ''
      this.log(`[${service.runningCount}/${service.desiredCount}] ${service.status} ${service.serviceName}  ${containerPort}`)
      const serviceTasks = existingTasks.filter(task =>  task.group === `service:${service.serviceName}`)
      for (const task of serviceTasks) {
        const container = task.containers && task.containers[0]
        if (container) {
          this.log([
            '',
            task.lastStatus,
            task.taskArn?.replace(taskArnPrefix, ''),
            container.name,
            container.image?.replace(ecrRepoPrefix, 'ecr:'),
            `cpu=${task.cpu}`,
            `memory=${task.memory}`,
            container.exitCode,
            container.reason,
          ].join('  '))
        }
      }
    }

    // Display tasks that aren't in services
    this.log(' ')
    const nonServiceTasks = existingTasks.filter(task => !task.group?.startsWith('service:'))
    for (const task of nonServiceTasks) {
      // const containerPort = service.loadBalancers && service.loadBalancers[0] ? `https:${service.loadBalancers[0].containerPort}` : ''
      this.log(`${task.lastStatus} ${task.taskArn?.replace(taskArnPrefix, '')} ${task.stopCode || ''} ${task.group}`)
      for (const container of task.containers || []) {
        this.log([
          '',
          container.name,
          container.image?.replace(ecrRepoPrefix, 'ecr:'),
          container.exitCode,
          container.reason,
        ].join('   '))
      }
    }
  }
}
