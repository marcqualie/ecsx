import { Configuration, KeyValuePairs } from '../types/configuration'

interface VariablesFromCluster {
  environment: string
  project?: string
  [key: string]: string | undefined
}

export const envVarsFromCluster = (clusterName: string, config: Configuration): KeyValuePairs => {
  const clusterConfig = config.clusters[clusterName]
  if (clusterConfig === undefined) {
    throw new Error(`Could not locate cluster with name "${clusterName}"`)
  }

  return clusterConfig.envVars || {}
}

export const envVarsFromTask = (taskName: string | undefined, config: Configuration): KeyValuePairs => {
  if (taskName === undefined) return {}

  const taskConfig = config.tasks[taskName]
  if (taskConfig === undefined) {
    throw new Error(`Could not locate task with name "${taskName}"`)
  }

  return taskConfig.envVars || {}
}
