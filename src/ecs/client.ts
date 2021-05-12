import { CreateServiceCommand, CreateServiceCommandInput, DescribeServicesCommand, DescribeServicesCommandInput, ECSClient, ListTaskDefinitionsCommand, RegisterTaskDefinitionCommand, RegisterTaskDefinitionCommandInput, RunTaskCommand, RunTaskCommandInput, UpdateServiceCommand, UpdateServiceCommandInput } from '@aws-sdk/client-ecs'

export const AWS_REGION = process.env.AWS_REGION || 'eu-central-1'

export const ecsClient = new ECSClient({
  region: AWS_REGION,
  maxAttempts: 5,
})

export const listTaskDefinitions = (params: any = {}) => {
  const command = new ListTaskDefinitionsCommand(params)
  return ecsClient.send(command)
}

export const registerTaskDefinition = (params: RegisterTaskDefinitionCommandInput) => {
  const command = new RegisterTaskDefinitionCommand(params)
  return ecsClient.send(command)
}

export const createService = (params: CreateServiceCommandInput) => {
  const command = new CreateServiceCommand(params)
  return ecsClient.send(command)
}

export const updateService = (params: UpdateServiceCommandInput) => {
  const command = new UpdateServiceCommand(params)
  return ecsClient.send(command)
}

export const runTask = (params: RunTaskCommandInput) => {
  const command = new RunTaskCommand(params)
  return ecsClient.send(command)
}

export const describeServices = (params: DescribeServicesCommandInput) => {
  const command = new DescribeServicesCommand(params)
  return ecsClient.send(command)
}

export const client = {
  region: AWS_REGION,
  createService,
  describeServices,
  listTaskDefinitions,
  registerTaskDefinition,
  runTask,
  updateService,
}
