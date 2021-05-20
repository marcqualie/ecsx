import pickBy from 'lodash/pickBy'
import identity from 'lodash/identity'
import { Configuration } from '../types/configuration'

interface VariablesFromCluster {
  environment: string
  project?: string
  [key: string]: string | undefined
}

export const variablesFromCluster = (clusterName: string, config: Configuration): VariablesFromCluster => {
  const clusterConfig = config.clusters[clusterName] || {}
  return pickBy({
    environment: clusterConfig.environment,
    project: clusterConfig.project,
  }, identity) as VariablesFromCluster
}
