import {flags} from '@oclif/command'
import {AwsCommand} from '../command'
import {serviceFromConfiguration} from '../ecs/service'

export default class CreateService extends AwsCommand {
  static description = 'Create AWS service from task definition'

  static examples = [
    `$ ecsy create-service lh-flightpass puma -e staging -r 7`
  ]

  static flags = {
    help: flags.help({
      char: 'h',
    }),
    var: flags.string({
      multiple: true,
      default: [],
    }),
    environment: flags.string({
      char: 'e',
      required: true,
    }),
    revision: flags.string({
      char: 'r',
      default: 'LATEST',
    }),
  }

  static args = [
    {
      name: 'family',
      type: 'string',
    },
    {
      name: 'task',
      type: 'string',
    },
  ]

  async run() {
    const {args: {family, task},flags:{environment, revision}} = this.parse(CreateService)
    const client = this.ecs_client()
    const { config, variables } = this.configWithVariables()

    // // Generate task definition input and send request to AWS API
    const serviceInput = serviceFromConfiguration({
      family,
      task,
      environment,
      revision,
      variables,
      config,
    })
    // console.log(JSON.stringify(serviceInput, undefined, 2))
    const response = await client.createService(serviceInput)
    const { service } = response
    if (service === undefined) {
      this.error(`Could not create task definition: ${response}`)
    }

    // Handy JSON output
    this.log(JSON.stringify({
      arn: service.serviceArn,
      url: `https://${variables.region}.console.aws.amazon.com/ecs/v2/clusters/${family}-${environment}/services/${task}/health?region=${client.region}`,
    }, undefined, 2))
  }
}
