import { flags } from '@oclif/command'
import cli, { Table } from 'cli-ux'
import { take } from 'lodash'
import uniq from 'lodash/uniq'
import flatten from 'lodash/uniq'

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
    const columns: Table.Columns = {
      count: {},
      status: {},
      name: {},
      image: {},
      ports: {
        get: (row: any) => (row.ports || []).join(','),
      },
      cpu: {
        header: 'vCPU',
      },
      memory: {},
      error: {},
    }
    const options: Table.Options = {
      printLine: this.log,
    }
    cli.table(
      existingServices.map(service => {
        const ports = (service.loadBalancers || []).map(loadBalancer => loadBalancer.containerPort)
        const serviceTasks = existingTasks.filter(task =>  task.group === `service:${service.serviceName}`)
        const task = serviceTasks[serviceTasks.length - 1]
        const container = task?.containers ? task.containers[0] : undefined
        const image = container?.image?.replace(ecrRepoPrefix, 'ecr:')

        return {
          count: `[${service.runningCount}/${service.desiredCount}] `,
          status: container?.lastStatus || service.status,
          name: service.serviceName,
          image,
          ports,
          cpu: task?.cpu || '',
          memory: task?.memory || '',
          error: task?.stoppedReason || task?.stopCode ? `[${task.stopCode}] ${container?.reason || task?.stoppedReason}` : '',
        }
      }),
      columns,
      options,
    )

    this.log(' ')
    this.log(' ')
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
