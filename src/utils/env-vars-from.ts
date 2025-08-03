import { findCluster } from '../config'

import type { Configuration, KeyValuePairs } from '../types/configuration'

interface VariablesFromCluster {
  environment: string
  project?: string
  [key: string]: string | undefined
}

export const envVarsFromCluster = (
  clusterName: string,
  region: string,
  config: Configuration,
): KeyValuePairs => {
  const clusterConfig = findCluster(config, clusterName, region)
  if (clusterConfig === undefined) {
    throw new Error(
      `Could not get envVars from cluster "${clusterName}" { ${clusterName}, ${region} }`,
    )
  }

  return clusterConfig.envVars || {}
}

export const envVarsFromTask = (
  taskName: string | undefined,
  config: Configuration,
): KeyValuePairs => {
  if (taskName === undefined) return {}

  const taskConfig = config.tasks[taskName]
  if (taskConfig === undefined) {
    throw new Error(`Could not locate task with name "${taskName}"`)
  }

  return taskConfig.envVars || {}
}
