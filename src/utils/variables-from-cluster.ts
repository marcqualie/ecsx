import pickBy from 'lodash/pickBy'
import identity from 'lodash/identity'
import { Configuration } from '../types/configuration'

interface VariablesFromCluster {
  environment: string
  project?: string
  clusterName: string
  region: string
  [key: string]: string | undefined
}

// Finds a cluster in the yml config file based on the key
export const variablesFromCluster = (clusterKey: string, config: Configuration): VariablesFromCluster => {
  const clusterConfig = config.clusters[clusterKey]
  if (clusterConfig === undefined) {
    throw new Error(`Could not locate variables from cluster "${clusterKey}"`)
  }

  return pickBy({
    environment: clusterConfig.environment,
    project: clusterConfig.project,
    clusterName: clusterConfig.name || clusterKey,
    region: clusterConfig.region,
  }, identity) as VariablesFromCluster
}
