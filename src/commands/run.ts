/* eslint-disable no-await-in-loop */
import { Flags } from '@oclif/core'
import { Task } from '@aws-sdk/client-ecs'
import cli from 'cli-ux'

import { AwsCommand } from '../command'
import { taskDefinitionfromConfiguration } from '../ecs/task-definition'
import { taskFromConfiguration } from '../ecs/task'

export default class RunCommand extends AwsCommand {
  static description = 'Run a one off task on the cluster'

  static flags = {
    help: Flags.help({ char: 'h' }),
    var: Flags.string({
      multiple: true,
      default: [],
    }),
    clusterKey: Flags.string({
      char: 'c',
      required: true,
    }),
    dockerTag: Flags.string({
      char: 't',
      required: true,
    }),
  }

  static args = [
    {
      name: 'taskName',
      type: 'string',
      required: true,
    },
  ]

  async run() {
    const { args: { taskName }, flags: { clusterKey, dockerTag } } = await this.parse(RunCommand)
    const { config, variables, envVars } = await this.configWithVariables({
      clusterKey,
      taskName,
      dockerTag,
    })
    const { accountId, environment, project, region, clusterName } = variables
    if (clusterName === undefined) {
      throw new Error('Could not detect $clusterName')
    }

    const client = this.ecsClient({ region })

    // Generate Task Definition
    const taskDefinitionInput = taskDefinitionfromConfiguration({
      clusterName,
      taskName,
      variables,
      config,
      envVars,
    })
    const taskDefinitionResponse = await client.registerTaskDefinition(taskDefinitionInput)
    const { taskDefinition } = taskDefinitionResponse
    if (taskDefinition === undefined) {
      this.error(`Could not create task definition: ${JSON.stringify(taskDefinitionResponse)}`)
    }

    // Run task using created definition
    const taskInput = taskFromConfiguration({
      clusterName,
      taskName,
      revision: taskDefinition.revision?.toString() || '',
      variables,
      config,
    })
    const runTaskResponse = await client.runTask(taskInput)
    const { tasks } = runTaskResponse
    if (tasks === undefined || tasks.length === 0) {
      this.error(`Could not run task: ${JSON.stringify(runTaskResponse)}`)
    }

    const firstTask = tasks[0]
    if (firstTask.taskArn === undefined) {
      this.error('Task does not have an ARN. Please try again.')
    }

    const taskId = firstTask.taskArn?.replace(`arn:aws:ecs:${region}:${accountId}:task/${project}-${environment}/`, '')
    const taskUrl = `https://${region}.console.aws.amazon.com/ecs/v2/clusters/${project}-${environment}/tasks/${taskId}/logs?region=${region}`
    this.log(`> Image: ${dockerTag}`)
    this.log(`> Task: ${firstTask.taskArn}`)
    this.log(`> URL: ${taskUrl}`)

    // Keep polling for updates
    let taskStatus: string | undefined
    let taskDetails: Task | undefined = firstTask
    cli.action.start('', taskStatus)
    while (taskStatus !== 'STOPPED') {
      taskDetails = await client.describeTask(clusterName, firstTask.taskArn)
      if (taskDetails === undefined) {
        this.error(`Could not find task details for taskArn "${firstTask.taskArn}"`)
      }

      taskStatus = taskDetails.lastStatus
      cli.action.start('', taskStatus)

      await new Promise(resolve => {
        setTimeout(resolve, 10_000)
      })
    }

    cli.action.stop(taskStatus)

    // If we did not get RUNNING then the console could not started properly, this should show why
    const firstContainer = taskDetails?.containers && taskDetails.containers[0]
    if (firstContainer === undefined) {
      this.error('Could not locate container definition')
    }

    // If the container failed, we want to know why
    const exitCode = firstContainer.exitCode
    const stopCode = firstTask.stopCode
    const containerReason = firstContainer.reason
    const errorReason = taskDetails.stoppedReason
    if (exitCode !== 0 || stopCode) {
      this.error(`Execution failed: [${stopCode || exitCode}] ${containerReason || errorReason}`)
    }

    this.log('Success!')
  }
}
