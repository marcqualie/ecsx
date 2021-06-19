/* eslint-disable no-await-in-loop */
import { Task } from '@aws-sdk/client-ecs'
import { flags } from '@oclif/command'
import flatten from 'lodash/flatten'
import cli from 'cli-ux'

import { AwsCommand } from '../command'
import { taskFromConfiguration } from '../ecs/task'
import { taskDefinitionfromConfiguration } from '../ecs/task-definition'
import { deployService } from '../ecs/deploy-service'
import { describeServices, describeTasks, listTasks } from '../ecs/client'

export default class ConsoleCommand extends AwsCommand {
  static description = 'Launch a temporary interactive container'

  static flags = {
    help: flags.help({
      char: 'h',
    }),
    clusterName: flags.string({
      char: 'c',
      required: true,
    }),
  }

  static args = [
    {
      name: 'command',
      type: 'array',
      default: [
        '/bin/sh',
      ],
    },
  ]

  async run() {
    const { args: { command }, flags: { clusterName } } = this.parse(ConsoleCommand)
    const client = this.ecs_client()
    const { config, variables, envVars } = this.configWithVariables({
      clusterName,
    })

    // Get docker tag from running web container
    const { taskArns: webTaskArns } = await listTasks({
      cluster: clusterName,
      serviceName: 'web',
    })
    // const activeWebServices = existingWebServices.filter(service => service.status === 'ACTIVE')
    const { tasks: existingWebTasks = [] } = await describeTasks({
      cluster: clusterName,
      tasks: webTaskArns,
    })
    const runningWebTasks = existingWebTasks.filter(task => task.lastStatus === 'RUNNING')
    const latestWebTask = runningWebTasks.sort((a, b) => (a.startedAt || 0) > (b.startedAt || 0) ? 1 : -1)[0]
    if (latestWebTask === undefined) {
      throw new Error('Could not locate a running web task. Please deploy first.')
    }
    const image = (latestWebTask.containers && latestWebTask.containers[0].image)
    if (image === undefined) {
      throw new Error('Could not find a valid container image inside web task.')
    }
    const imageParts = image.split(':')
    const dockerTag = imageParts[imageParts.length - 1]
    this.log(`> Image: ${dockerTag}`)

    // Launch a new service
    // TODO: Re-connect to an already running service
    this.log('> Starting a service for console')
    const service = await deployService({
      clusterName,
      taskName: 'console',
      commandOverride: [
        'sleep',
        '3360',
      ],
      variables: {
        ...variables,
        dockerTag,
      },
      config,
      envVars,
    })
    this.log(`> Service: ${service.serviceArn}`)
    const { taskArns: existingConsoleTaskArns } = await listTasks({
      cluster: clusterName,
      serviceName: service.serviceArn,
    })
    const { tasks: existingConsoleTasks } = await describeTasks({
      cluster: clusterName,
      tasks: existingConsoleTaskArns,
    })
    if (existingConsoleTasks === undefined || existingConsoleTasks.length === 0 || existingConsoleTasks[0] === undefined) {
      throw new Error('No running console tasks to connect to')
    }
    const task = existingConsoleTasks[0]
    this.log(`> Task: ${task.taskArn}`)
    this.log(`> TaskDefinition: ${task.taskDefinitionArn}`)

    let taskDetails: Task | undefined = await client.describeTask(clusterName, task.taskArn || '')
    let taskStatus: string | undefined = taskDetails?.lastStatus
    let errorReason: string | undefined
    let stopCode: string | undefined
    cli.action.start('', taskStatus)
    while (taskStatus === undefined || taskStatus === 'PROVISIONING' || taskStatus === 'PENDING' || taskStatus === 'DEPROVISIONING') {
      await new Promise(resolve => setTimeout(resolve, 10000))
      taskDetails = await client.describeTask(clusterName, task.taskArn || '')
      if (taskDetails === undefined) {
        this.error(`Could not find task details for taskArn "${task.taskArn}"`)
      }
      taskStatus = taskDetails.lastStatus
      cli.action.start('', taskStatus)
    }
    cli.action.stop(taskStatus)

    // Edge cases when details were not found
    if (taskDetails === undefined) {
      throw new Error('Corrupt task details. Please try again.')
    }

    // If we did not get RUNNING then the console could not started properly, this should show why
    if (taskStatus !== 'RUNNING') {
      errorReason = taskDetails.stoppedReason
      stopCode = taskDetails.stopCode // Not the numerical exit code
      this.error(`Could not start task: [${stopCode}] ${errorReason}`)
    }

    // TODO: Validate command input
    // To avoid building this into the tool, just use aws cli directly
    this.log('> Ready: Run the the following command to connect to the task')
    this.log(' ')
    this.log(`$ aws ecs execute-command --cluster ${clusterName} --task ${taskDetails.taskArn} --container console --interactive --command "${command}"`)
    this.log(' ')

    // this.log(JSON.stringify({
    //   serviceArn: updatedService.serviceArn,
    //   taskDefinitionArn: updatedService?.taskDefinition,
    //   desiredCount: updatedService.desiredCount,
    //   url: `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/services/${task}/health?region=${region}`,
    // }, undefined, 2))
  }
}
