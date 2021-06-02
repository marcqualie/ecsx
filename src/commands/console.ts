/* eslint-disable no-await-in-loop */
import { Task } from '@aws-sdk/client-ecs'
import { flags } from '@oclif/command'
import { AwsCommand } from '../command'
import { taskFromConfiguration } from '../ecs/task'
import cli from 'cli-ux'

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
    const clusterConfig = config.clusters[clusterName]

    // Ensure there is a console task defined
    const { consoleTask } = clusterConfig
    if (consoleTask === undefined) {
      this.error('Cannot find console task for cluster')
    }
    this.log(`> Running command ${command} inside ${consoleTask}`)

    // Find running service matching task name to get the task definition revision
    const { services: existingServices = [] } = await client.describeServices({
      cluster: clusterName,
      services: [
        consoleTask,
      ],
    })
    const activeServices = existingServices.filter(service => service.status === 'ACTIVE')
    const service = activeServices[0]
    if (service === undefined) {
      this.error(`Could not find service mcatching name ${consoleTask}`)
    }

    // Run task using created definition
    const taskDefinitionArnParts = service.taskDefinition?.split(':') || []
    const revision = taskDefinitionArnParts.pop() || ''
    this.log(`> TaskDefinition: ${service.taskDefinition}`)

    const taskInput = taskFromConfiguration({
      clusterName,
      taskName: consoleTask,
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
    this.log(`> Image: ${dockerTag}`)
    this.log(`> Task: ${firstTask.taskArn}`)

    let taskStatus: string | undefined
    let taskDetails: Task | undefined = firstTask
    cli.action.start('', taskStatus)
    while (taskStatus !== 'RUNNING') {
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

    // TODO: Validate command input
    // To avoid building this into the tool, just use aws cli directly
    this.log('> Ready: Run the the following command to connect to the task')
    this.log(' ')
    this.log(`$ aws ecs execute-command --cluster ${clusterName} --task ${taskDetails.taskArn} --container ${consoleTask} --interactive --command "${command}"`)
    this.log(' ')

    // this.log(JSON.stringify({
    //   serviceArn: updatedService.serviceArn,
    //   taskDefinitionArn: updatedService?.taskDefinition,
    //   desiredCount: updatedService.desiredCount,
    //   url: `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/services/${task}/health?region=${region}`,
    // }, undefined, 2))
  }
}
