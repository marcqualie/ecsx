import { CreateServiceCommand, CreateServiceCommandInput, DeleteServiceCommand, DeleteServiceCommandInput, DescribeClustersCommand, DescribeClustersCommandInput, DescribeServicesCommand, DescribeServicesCommandInput, DescribeTasksCommand, DescribeTasksCommandInput, ECSClient, ListServicesCommand, ListServicesCommandInput, ListTaskDefinitionsCommand, ListTasksCommand, ListTasksCommandInput, RegisterTaskDefinitionCommand, RegisterTaskDefinitionCommandInput, RunTaskCommand, RunTaskCommandInput, UpdateServiceCommand, UpdateServiceCommandInput } from '@aws-sdk/client-ecs'

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

export const describeClusters = (params: DescribeClustersCommandInput) => {
  const command = new DescribeClustersCommand(params)
  return ecsClient.send(command)
}

export const describeCluster = async (clusterName: string) => {
  const clusters = await describeClusters({
    clusters: [
      clusterName,
    ],
  })

  return clusters.clusters && clusters.clusters[0]
}

export const describeServices = (params: DescribeServicesCommandInput) => {
  const command = new DescribeServicesCommand(params)
  return ecsClient.send(command)
}

export const describeTasks = (params: DescribeTasksCommandInput) => {
  const command = new DescribeTasksCommand(params)
  return ecsClient.send(command)
}

export const describeTask = async (clusterName: string, taskArn: string) => {
  const response = await describeTasks({ cluster: clusterName, tasks: [taskArn] })
  return response.tasks && response.tasks[0]
}

export const listTasks = (params: ListTasksCommandInput) => {
  const command = new ListTasksCommand(params)
  return ecsClient.send(command)
}

export const listServices = (params: ListServicesCommandInput) => {
  const command = new ListServicesCommand(params)
  return ecsClient.send(command)
}

export const deleteService = (params: DeleteServiceCommandInput) => {
  const command = new DeleteServiceCommand(params)
  return ecsClient.send(command)
}

export const client = {
  region: AWS_REGION,
  createService,
  deleteService,
  describeCluster,
  describeClusters,
  describeServices,
  describeTask,
  describeTasks,
  listTaskDefinitions,
  listTasks,
  listServices,
  registerTaskDefinition,
  runTask,
  updateService,
}
