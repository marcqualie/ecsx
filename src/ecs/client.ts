import { CreateServiceCommand, CreateServiceCommandInput, DeleteServiceCommand, DeleteServiceCommandInput, DescribeClustersCommand, DescribeClustersCommandInput, DescribeServicesCommand, DescribeServicesCommandInput, DescribeTasksCommand, DescribeTasksCommandInput, ECSClient, ListServicesCommand, ListServicesCommandInput, ListTaskDefinitionsCommand, ListTaskDefinitionsCommandInput, ListTasksCommand, ListTasksCommandInput, RegisterTaskDefinitionCommand, RegisterTaskDefinitionCommandInput, RunTaskCommand, RunTaskCommandInput, UpdateServiceCommand, UpdateServiceCommandInput } from '@aws-sdk/client-ecs'

interface ClientBuilderParams {
  region: string
}

// Simplifies the command creation since 90% boilerplate
const wrapCommand = <T extends (params: P) => void, P = Parameters<T>, C = any>(name: string, callback: (params: P) => C) => {
  return (params: P): C => {
    return callback(params)
  }
}

export const clientBuilder = ({ region }: ClientBuilderParams) => {
  const ecsClient = new ECSClient({
    region,
    maxAttempts: 5,
  })

  const createService = wrapCommand('createService', (params: CreateServiceCommandInput) => ecsClient.send(new CreateServiceCommand(params)))
  const deleteService = wrapCommand('deleteService', (params: DeleteServiceCommandInput) => ecsClient.send(new DeleteServiceCommand(params)))
  const describeClusters = wrapCommand('describeClusters', (params: DescribeClustersCommandInput) => ecsClient.send(new DescribeClustersCommand(params)))
  const describeServices = wrapCommand('describeServices', (params: DescribeServicesCommandInput) => ecsClient.send(new DescribeServicesCommand(params)))
  const describeTasks = wrapCommand('describeTasks', (params: DescribeTasksCommandInput) => ecsClient.send(new DescribeTasksCommand(params)))
  const listServices = wrapCommand('listServices', (params: ListServicesCommandInput) => ecsClient.send(new ListServicesCommand(params)))
  const listTaskDefinitions = wrapCommand('listTaskDefinitions', (params: ListTaskDefinitionsCommandInput) => ecsClient.send(new ListTaskDefinitionsCommand(params)))
  const listTasks = wrapCommand('listTasks', (params: ListTasksCommandInput) => ecsClient.send(new ListTasksCommand(params)))
  const registerTaskDefinition = wrapCommand('registerTaskDefinition', (params: RegisterTaskDefinitionCommandInput) => ecsClient.send(new RegisterTaskDefinitionCommand(params)))
  const runTask = wrapCommand('runTask', (params: RunTaskCommandInput) => ecsClient.send(new RunTaskCommand(params)))
  const updateService = wrapCommand('updateService', (params: UpdateServiceCommandInput) => ecsClient.send(new UpdateServiceCommand(params)))

  const describeTask = async (clusterName: string, taskArn: string) => {
    const response = await describeTasks({ cluster: clusterName, tasks: [taskArn] })
    return response.tasks && response.tasks[0]
  }

  const describeCluster = async (clusterName: string) => {
    const clusters = await describeClusters({
      clusters: [
        clusterName,
      ],
    })

    return clusters.clusters && clusters.clusters[0]
  }

  return {
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
}
