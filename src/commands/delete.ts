import { flags } from '@oclif/command'
import { cli } from 'cli-ux'

import { AwsCommand } from '../command'
import { client } from '../ecs/client'
import { deployService } from '../ecs/deploy-service'

export default class DeleteCommand extends AwsCommand {
  static description = 'Remove a service/task from a cluster'

  static flags = {
    help: flags.help({ char: 'h' }),
    clusterName: flags.string({
      char: 'c',
      required: true,
    }),
    force: flags.boolean({
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
    const { args: { taskName }, flags: { clusterName, force = false } } = this.parse(DeleteCommand)
    const { config, variables, envVars } = this.configWithVariables({
      clusterName,
    })

    // Verify the task actually exists on the cluster
    // TODO

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
