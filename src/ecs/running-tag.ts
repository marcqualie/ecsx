import { clientBuilder } from './client'

interface Params {
  clusterName: string
  taskName: string
  region: string
}

// Find the docker tag of the container currently running for a service.
// The tag is the portion of the image after the final colon, e.g.
// `123.dkr.ecr.eu-central-1.amazonaws.com/project:abc123` -> `abc123`
export const runningTag = async (
  params: Params,
): Promise<string | undefined> => {
  const { clusterName, taskName, region } = params
  const client = clientBuilder({ region })

  const { taskArns = [] } = await client.listTasks({
    cluster: clusterName,
    serviceName: taskName,
    desiredStatus: 'RUNNING',
    maxResults: 20,
  })
  if (taskArns.length === 0) {
    return undefined
  }

  const { tasks = [] } = await client.describeTasks({
    cluster: clusterName,
    tasks: taskArns,
  })

  // Use the most recently started task to reflect the live tag
  const task = tasks.sort((a, b) =>
    (a.startedAt || 0) < (b.startedAt || 0) ? 1 : -1,
  )[0]
  const container =
    task?.containers?.find((container) => container.name === taskName) ||
    task?.containers?.[0]
  const image = container?.image
  if (image === undefined) {
    return undefined
  }

  return image.split(':').pop()
}
