/* eslint-disable no-await-in-loop */
import { Task } from '@aws-sdk/client-ecs'
import { flags } from '@oclif/command'
import cli from 'cli-ux'

import { AwsCommand } from '../command'
import { taskFromConfiguration } from '../ecs/task'

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
    const { config, variables } = this.configWithVariables({
      clusterName,
    })

    // Ensure there is a console task defined
    const consoleTask = config.tasks.console
    if (consoleTask === undefined) {
      this.error('Could not locale console task in config. Please adjust config then try again')
    }

    // Find running service matching task name to get the task definition revision
    const { services: existingWebServices = [] } = await client.describeServices({
      cluster: clusterName,
      services: [
        'web', // NOTE: We follow convention of web/console
      ],
    })
    const activeWebServices = existingWebServices.filter(service => (service.status === 'ACTIVE' || service.status === 'RUNNING'))
    const webService = activeWebServices[0]
    if (webService === undefined) {
      this.error('Could not find running web service to grab container definition')
    }

    // Run task using created definition
    const taskDefinitionArnParts = webService.taskDefinition?.split(':') || []
    const revision = taskDefinitionArnParts.pop() || ''
    this.log('> TaskDefinition:', webService.taskDefinition)

    const taskInput = taskFromConfiguration({
      clusterName,
      taskName: 'console',
      alias: 'console',
      revision,
      variables,
      config,
      enableExecuteCommand: true,
    })

    const runTaskResponse = await client.runTask(taskInput)
    const { tasks } = runTaskResponse
    if (tasks === undefined || tasks.length === 0) {
      this.error(`Could not create task definition: ${runTaskResponse}`)
    }
    const firstTask = tasks[0]
    if (firstTask.taskArn === undefined) {
      this.error('Task not not have an arn')
    }
    const dockerTag = firstTask.containers && firstTask.containers[0].image
    this.log('> Image:', dockerTag)
    this.log('> Task:', firstTask.taskArn)

    let taskStatus: string | undefined
    let taskDetails: Task | undefined = firstTask
    let errorReason: string | undefined
    let stopCode: string | undefined
    cli.action.start('', taskStatus)
    while (taskStatus === undefined || taskStatus === 'PROVISIONING' || taskStatus === 'PENDING' || taskStatus === 'DEPROVISIONING') {
      taskDetails = await client.describeTask(clusterName, firstTask.taskArn)
      if (taskDetails === undefined) {
        this.error(`Could not find task details for taskArn "${firstTask.taskArn}"`)
      }
      taskStatus = taskDetails.lastStatus
      cli.action.start('', taskStatus)

      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve, 10000))
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
    this.log(`$ aws ecs execute-command --cluster ${clusterName} --task ${taskDetails.taskArn} --container console --interactive --command "${command}"`)
    this.log(' ')
  }
}
