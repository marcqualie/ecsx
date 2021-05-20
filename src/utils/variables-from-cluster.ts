import { Configuration } from '../types/configuration'

export const variablesFromCluster = (clusterName: string, config: Configuration) => {
  const clusterConfig = config.clusters[clusterName] || {}
  return {
    environment: clusterConfig.environment,
  }
}
