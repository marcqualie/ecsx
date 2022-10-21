import { Flags } from '@oclif/core'
import { cli } from 'cli-ux'

import { AwsCommand } from '../command'
import { clientBuilder } from '../ecs/client'

export default class DeleteCommand extends AwsCommand {
  static description = 'Remove a service/task from a cluster'

  static flags = {
    help: Flags.help({ char: 'h' }),
    clusterKey: Flags.string({
      char: 'c',
      required: true,
    }),
    force: Flags.boolean({
      default: false,
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
    const { args: { taskName }, flags: { clusterKey, force = false } } = await this.parse(DeleteCommand)
    const { variables } = await this.configWithVariables({
      clusterKey,
    })
    const { clusterName, region } = variables
    const client = clientBuilder({ region })

    // TODO: Verify the task actually exists on the cluster

    // Verify they want to delete
    const confirmed = await cli.confirm(`Do you want to remove ${taskName} from your cluster?`)
    if (confirmed === false) {
      this.warn('Nothing was altered on your cluster.')
      return
    }

    // Action the deletion
    const response = await client.deleteService({
      cluster: clusterName,
      service: taskName,
      force,
    })
    if (response.$metadata.httpStatusCode === 200) {
      this.log(`The task "${taskName}" has been removed from your cluster. This could take a few minutes to drain.`)
    } else {
      this.error(`The task "${taskName}" could not be removed from your cluster. Please try again.`)
    }
  }
}
