import { flags } from '@oclif/command'

import { AwsCommand } from '../command'
import { deployService } from '../ecs/deploy-service'

export default class DeployCommand extends AwsCommand {
  static description = 'Create a task definition then deploy it as a service'

  static flags = {
    help: flags.help({ char: 'h' }),
    var: flags.string({
      multiple: true,
      default: [],
    }),
    clusterName: flags.string({
      char: 'c',
      required: true,
    }),
    dockerTag: flags.string({
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
    const { args: { taskName }, flags: { clusterName, dockerTag } } = this.parse(DeployCommand)
    const { config, variables, envVars } = this.configWithVariables({
      clusterName,
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
