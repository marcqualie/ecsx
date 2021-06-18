import { flags } from '@oclif/command'
import cli from 'cli-ux'

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
    const { taskArns: runningTaskArns = [] } = await client.listTasks({
      cluster: clusterName,
      desiredStatus: 'RUNNING',
    })
    const { taskArns: stoppedTaskArns = [] } = await client.listTasks({
      cluster: clusterName,
      desiredStatus: 'STOPPED',
    })
    const { tasks: existingTasks = [] } = await client.describeTasks({
      cluster: clusterName,
      tasks: [
        ...runningTaskArns,
        ...stoppedTaskArns,
      ],
    })

    // Find services within cluster
    const { services: existingServices = [] } = await client.describeServices({
      cluster: clusterName,
      services: Object.keys(config.tasks).filter(task => !task.startsWith('$')),
    })

    // Output table of services
    const servicesData = existingServices.map(service => {
      const ports = (service.loadBalancers || []).map(loadBalancer => loadBalancer.containerPort)
      const serviceTasks = existingTasks.filter(task =>  task.group === `service:${service.serviceName}`)
      const task = serviceTasks[serviceTasks.length - 1]
      const container = task?.containers ? task.containers[0] : undefined
      const image = container?.image?.replace(ecrRepoPrefix, 'ecr:')

      return {
        count: `[${service.runningCount}/${service.desiredCount}] `,
        status: container?.lastStatus ||  service.status,
        name: service.serviceName,
        image,
        ports,
        cpu: task?.cpu || '',
        memory: task?.memory || '',
        error: task?.stoppedReason || task?.stopCode ? `[${task.stopCode}] ${container?.reason || task?.stoppedReason}` : '',
      }
    })
    cli.table(
      servicesData,
      {
        count: {},
        status: {},
        name: {},
        image: {},
        ports: {
          get: row => (row.ports || []).join(','),
        },
        cpu: {
          header: 'vCPU',
        },
        memory: {},
        error: {},
      },
      {
        printLine: this.log,
      },
    )
    this.log(' ')

    // LIst out any tasks that are not linked to services
    const nonServiceTasks = existingTasks.filter(task => !task.group?.startsWith('service:'))
    const tasksData = nonServiceTasks.map(task => {
      const container = task?.containers ? task.containers[0] : undefined
      const image = container?.image?.replace(ecrRepoPrefix, '')

      return {
        status: container?.lastStatus || task.lastStatus,
        id: task.taskArn?.replace(taskArnPrefix, ''),
        group: task.group,
        image,
        error: container?.reason ? `[${container?.exitCode}] ${container?.reason}` : '',
      }
    })
    cli.table(
      tasksData,
      {
        status: {},
        id: {},
        group: {},
        image: {},
        error: {},
      },
      {
        printLine: this.log,
      },
    )
  }
}
