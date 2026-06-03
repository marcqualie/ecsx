import { Args, Flags } from '@oclif/core'

import { AwsCommand } from '../command'
import { deployService } from '../ecs/deploy-service'
import { runningTag } from '../ecs/running-tag'

export default class RedeployCommand extends AwsCommand {
  static description =
    'Redeploy a service using its currently running tag, recycling the containers'

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
  }

  static args = {
    taskName: Args.string({
      description: 'Name of the task to redeploy',
      required: true,
    }),
  }

  async run() {
    const {
      args: { taskName },
      flags: { clusterKey },
    } = await this.parse(RedeployCommand)

    // Resolve the cluster first so we can look up the currently running tag
    const {
      variables: { clusterName, region },
    } = await this.configWithVariables({ clusterKey, taskName })
    if (clusterName === undefined) {
      throw new Error('Could not detect $clusterName')
    }

    const dockerTag = await runningTag({ clusterName, taskName, region })
    if (dockerTag === undefined) {
      throw new Error(
        `Could not detect a running tag for service '${taskName}' in cluster '${clusterName}'`,
      )
    }
    this.log(`> Redeploying ${taskName} with tag ${dockerTag}`)

    // Re-parse the config with the resolved tag so it interpolates into the image
    const { config, variables, envVars } = await this.configWithVariables({
      clusterKey,
      taskName,
      dockerTag,
    })

    const service = await deployService({
      clusterName,
      taskName,
      variables,
      config,
      envVars,
    })

    for (const [key, value] of Object.entries(service)) {
      this.log(`> ${key}: ${value}`)
    }
  }
}
