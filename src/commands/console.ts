/* eslint-disable no-await-in-loop */
import { Task } from '@aws-sdk/client-ecs'
import { Flags } from '@oclif/core'
import cli from 'cli-ux'

import { AwsCommand } from '../command'
import { taskFromConfiguration } from '../ecs/task'

export default class ConsoleCommand extends AwsCommand {
  static description = 'Launch a temporary interactive container'

  static flags = {
    help: Flags.help({
      char: 'h',
    }),
    clusterKey: Flags.string({
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
    const { args: { command }, flags: { clusterKey } } = await this.parse(ConsoleCommand)
    const { config, variables } = await this.configWithVariables({
      clusterKey,
    })
    const { clusterName, region } = variables
    if (clusterName === undefined) {
      throw new Error('Could not detect $clusterName')
    }

    const client = this.ecsClient({ region })

    // Ensure there is a console task defined
    // TODO: If custom console command is specified, definition may not already exist
    const taskDefinitionName = config.tasks.web ? 'web' : 'console'
    const consoleTaskConfig = config.tasks[taskDefinitionName]
    if (consoleTaskConfig === undefined) {
      this.error(`Could not locale "${taskDefinitionName}" task in config. Please adjust config then try again`)
    }

    // Find running service matching task name to get the task definition revision
    const { services: existingWebServices = [] } = await client.describeServices({
      cluster: clusterName,
      services: [
        'web', // NOTE: We follow convention of web/console
      ],
    })
    const activeWebService = existingWebServices.find(service => (service.status === 'ACTIVE' || service.status === 'RUNNING'))
    const webService = activeWebService
    if (webService === undefined) {
      this.error('Could not find running web service to grab container definition')
    }

    // Run task using created definition
    const taskDefinitionArnParts = webService.taskDefinition?.split(':') || []
    const revision = taskDefinitionArnParts.pop() || ''
    this.log('> TaskDefinition:', webService.taskDefinition)

    const taskInput = taskFromConfiguration({
      clusterName,
      taskName: taskDefinitionName,
      alias: 'console',
      revision,
      variables,
      config,
      enableExecuteCommand: true,
    })

    const runTaskResponse = await client.runTask(taskInput)
    const { tasks } = runTaskResponse
    if (tasks === undefined || tasks.length === 0) {
      this.error(`Could not run task: ${JSON.stringify(runTaskResponse)}`)
    }

    const consoleTask = tasks[0]
    if (consoleTask.taskArn === undefined) {
      this.error('Task not not have an arn')
    }

    const dockerTag = consoleTask.containers && consoleTask.containers[0].image
    this.log('> Image:', dockerTag)
    this.log('> Task:', consoleTask.taskArn)

    let taskDetails: Task | undefined = consoleTask
    let taskStatus: string | undefined = consoleTask.lastStatus
    let errorReason: string | undefined
    let stopCode: string | undefined
    cli.action.start('', taskStatus)
    while (taskStatus === undefined || taskStatus === 'PROVISIONING' || taskStatus === 'PENDING' || taskStatus === 'DEPROVISIONING') {
      await new Promise(resolve => {
        setTimeout(resolve, 5000)
      })
      taskDetails = await client.describeTask(clusterName, consoleTask.taskArn)
      if (taskDetails === undefined) {
        this.error(`Could not find task details for taskArn "${consoleTask.taskArn}"`)
      }

      if (taskStatus !== taskDetails.lastStatus) {
        taskStatus = taskDetails.lastStatus
        cli.action.start('', taskStatus)
      }
    }

    cli.action.stop(taskStatus)

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
    this.log(`$ aws ecs execute-command --cluster ${clusterName} --task ${taskDetails.taskArn} --container ${taskDefinitionName} --interactive --command "${command}"`)
    this.log(' ')
  }
}
