/* eslint-disable no-await-in-loop */
import { Flags } from '@oclif/core'
import cli from 'cli-ux'
import uniq from 'lodash/uniq'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { AwsCommand } from '../command'

dayjs.extend(relativeTime)

export default class PsCommand extends AwsCommand {
  static description = 'Show running services within a cluster'

  static flags = {
    help: Flags.help({
      char: 'h',
    }),
    clusterKey: Flags.string({
      char: 'c',
      description: 'Name of the cluster key from the config',
    }),
    showTasks: Flags.boolean({
      description: 'Show recent tasks',
    }),
  }

  async run() {
    const { flags: { clusterKey: primaryClusterKey, showTasks } } = await this.parse(PsCommand)
    const { config } = await this.configWithVariables({
      clusterKey: primaryClusterKey,
    })
    const clusterKeys = primaryClusterKey ? [primaryClusterKey] : Object.keys(config.clusters)
    for (const clusterKey of clusterKeys) {
      const { config, variables: { accountId, clusterName, environment, project, region } } = await this.configWithVariables({
        clusterKey,
      })
      const client = this.ecsClient({ region })

      // Common patterns we can ignore from outputs
      const serviceArnPrefix = `arn:aws:ecs:${region}:${accountId}:service/${clusterName}/`
      const taskArnPrefix = `arn:aws:ecs:${region}:${accountId}:task/${clusterName}/`
      const ecrAccountPrefix = `${accountId}.dkr.ecr.${region}.amazonaws.com/`

      // Find all tasks within cluster
      const { taskArns: runningTaskArns = [] } = await client.listTasks({
        cluster: clusterName,
        desiredStatus: 'RUNNING',
        maxResults: 20,
      })
      const { taskArns: stoppedTaskArns = [] } = await client.listTasks({
        cluster: clusterName,
        desiredStatus: 'STOPPED',
        maxResults: 20,
      })
      const allTaskArns = [
        ...runningTaskArns,
        ...stoppedTaskArns,
      ]
      const { tasks: existingTasks = [] } = allTaskArns.length > 0 ? await client.describeTasks({
        cluster: clusterName,
        tasks: allTaskArns,
      }) : { tasks: [] }

      // Find all services/tasks defined in local config
      const configServiceNames = Object.entries(config.tasks).filter(([taskName, taskConfig]) => !taskName.startsWith('$') && (taskConfig.service === true || taskConfig.service === undefined)).map(([taskName]) => taskName)
      // const configTaskNames = Object.entries(config.tasks).filter(([taskName, taskConfig]) => !taskName.startsWith('$') && taskConfig.service === false).map(([taskName]) => taskName)

      // Find services within cluster
      // TODO: Remove tasks where service=false
      const { serviceArns: existingServiceArns = [] } = await client.listServices({
        cluster: clusterName,
      })
      const allServiceNames = uniq([
        ...existingServiceArns.map(arn => arn.replace(serviceArnPrefix, '')),
        ...configServiceNames,
      ]).sort()
      const { services: existingServices = [] } = await client.describeServices({
        cluster: clusterName,
        services: allServiceNames,
      })

      // Cluster overview
      this.log(' ')
      this.log(` ${clusterKey} (${project}, ${region})`)
      this.log(' ')

      // Output table of services
      const servicesData = allServiceNames.map(serviceName => {
        const service = existingServices.find(service => service.serviceName === serviceName)
        const ports = (service?.loadBalancers || []).map(loadBalancer => loadBalancer.containerPort)
        const serviceTasks = existingTasks.filter(task =>  task.group === `service:${service?.serviceName}`)
        const task = serviceTasks.sort((a, b) => (a.startedAt || 0) < (b.startedAt || 0) ? 1 : -1)[0]
        const container = task?.containers ? task.containers[0] : undefined
        const image = container?.image?.replace(ecrAccountPrefix, 'ecr/')?.replace(new RegExp(`${accountId}.dkr.ecr.[^.]+.amazonaws.com/`), 'ecr/') || ''

        return {
          count: `[${service?.runningCount || 0}/${service?.desiredCount === undefined ? '-' : service?.desiredCount}] `,
          status: container?.lastStatus || service?.status || '',
          name: serviceName,
          uptime: task?.startedAt ? dayjs(task.startedAt).fromNow(true) : '',
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
          count: {
            minWidth: 8,
          },
          status: {
            minWidth: 10,
          },
          uptime: {},
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
          printLine: this.log.bind(this),
        },
      )
      this.log(' ')

      // Find all tasks in cluster
      if (showTasks) {
        const allNonServiceTaskArns = existingTasks.filter(task => task.group?.startsWith('service:') === false).map(task => task.taskArn || '')
        const allTaskNames = uniq([
          ...allNonServiceTaskArns.map(arn => arn.replace(taskArnPrefix, '')),
          // ...configTaskNames, // TODO: These don't actually add much value in output
        ])

        // LIst out any tasks that are not linked to services
        const tasksData = allTaskNames.map(taskName => {
          const task = existingTasks.find(task => task.taskArn === `${taskArnPrefix}${taskName}`)
          const container = task?.containers ? task.containers[0] : undefined
          const image = container?.image?.replace(ecrAccountPrefix, 'ecr/').replace(new RegExp(`${accountId}.dkr.ecr.[^.]+.amazonaws.com/`), 'ecr/')
          const revision = task?.taskDefinitionArn?.split(':').pop()

          return {
            id: task?.taskArn?.replace(taskArnPrefix, '') || '',
            status: container?.lastStatus || task?.lastStatus || '',
            group: task?.group?.replace('task:', '') || '',
            image,
            revision,
            error: container?.reason ? `[${container?.exitCode}] ${container?.reason}` : '',
          }
        })
        cli.table(
          tasksData,
          {
            id: {
              header: 'ID',
              minWidth: 8,
              get: row => row.id.slice(0, 7),
            },
            status: {
              minWidth: 10,
            },
            group: {},
            image: {},
            revision: {},
            error: {},
          },
          {
            printLine: this.log.bind(this),
          },
        )
      }
    }
  }
}
