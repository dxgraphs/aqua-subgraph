import { writeFile, readFile } from 'fs/promises'
import type { providers } from 'ethers'
import { render } from 'mustache'
import { inspect } from 'util'
import axios from 'axios'

// EVM utils
import { wait } from './time'
import { getLastBlock } from './evm'
import { execAsync } from './contracts'
import { GRAPH_ADMIN_ENDPOINT, SUBGRAPH_SYNC_SECONDS } from './constants'
import { getLogger, Namespace } from './logger'

const logger = getLogger(Namespace.SUBGRAPH)
logger.level = 'info'

export interface BuildSubgraphYmlProps {
  network: string | 'mainnet' | 'ropsten' | 'rinkeby' | 'kovan' | 'local'
  startBlock: number
  contracts: {
    aquaFactory: {
      address: string
    }
    saleLauncher: {
      address: string
    }
    templateLauncher: {
      address: string
    }
    participantListLauncher: {
      address: string
    }
  }
}

export async function buildSubgraphYaml(viewProps: BuildSubgraphYmlProps) {
  // Get the template
  logger.info('Building subgraph manifest...')
  const subgraphYamlTemplate = await readFile('./subgraph.template.yaml', {
    encoding: 'utf8'
  })
  const subgraphYamlOut = render(subgraphYamlTemplate, viewProps)
  // Write the file
  await writeFile('./subgraph.yaml', subgraphYamlOut)
  logger.info('OK')
}


/**
 * Queries a given subgraph
 * @param subgraphName
 * @param query
 * @returns
 */
export async function querySubgraph(subgraphName: string, query: string) {
  const res = await axios.post(
    `http://localhost:8000/subgraphs/name/${subgraphName}`,
    {
      query
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  if (res.data?.data && !res.data?.errors?.length) {
    return res.data
  } else {
    throw new Error(`Query failed: ${inspect(res.data.errors, false, null, true)}`)
  }
}


interface WaitForGraphSyncParams {
  provider: providers.JsonRpcProvider
  targetBlockNumber?: number
  subgraphName: string
}

/**
 * Waits for graph-node to be up after launching docker.
 * @param {number} [timeout=10000] (optional) Time in ms after which error is thrown
 */

export async function waitForSubgraphUp(timeout = 10000) {
  let retryCt = 0
  let success = false

  logger.info('Setting up subgraph...')
  // No better idea to suppress console errors
  const consoleError = console.error
  console.error = () => { }

  while (retryCt * 100 < timeout) {
    try {
      await wait(100)
      const { data } = await axios.post('http://localhost:8030/graphql', {
        query: `{
            indexingStatuses {
              subgraph
            }
        }`
      })

      if (data) {
        success = true
        logger.info('OK')
        console.error = consoleError
        break;
      }
    } catch (e) { }

    retryCt++
  }
  if (!success) {
    logger.info('Failed to set up subgraph')
  }
}

export async function waitForGraphSync({ provider, targetBlockNumber, subgraphName }: WaitForGraphSyncParams) {
  targetBlockNumber = targetBlockNumber || (await getLastBlock(provider)).number
  let isSynced = false

  logger.info(`Waiting for subgraph "${subgraphName}" to sync block #${targetBlockNumber}`)

  while (true) {
    try {
      await wait(100)
      const { data: {
        data: {
          indexingStatusForCurrentVersion
        }
      } } = await axios.post('http://localhost:8030/graphql', {
        query: `{
            indexingStatusForCurrentVersion(subgraphName: "${subgraphName}") {
            synced
            chains {
              chainHeadBlock {
                number
              }
              latestBlock {
                number
              }
            }
          }
        }`
      })

      if (indexingStatusForCurrentVersion.synced && indexingStatusForCurrentVersion.chains[0].latestBlock.number == targetBlockNumber) {
        logger.info(`Subgraph "${subgraphName}" has synced with block #${targetBlockNumber}`)
        isSynced = true
        break;
      }
    } catch (e) {
      console.error(e)
    }
  }
}


export function createSubgraph(subgraphName: string) {
  return axios.post(GRAPH_ADMIN_ENDPOINT,
    JSON.stringify({
      jsonrpc: "2.0",
      method: "subgraph_create",
      params: {
        name: subgraphName
      },
      id: 1
    }))
}

export function deploySubgraph(subgraphName: string) {
  return axios.post(GRAPH_ADMIN_ENDPOINT, {
    jsonrpc: "2.0",
    method: "subgraph_deploy",
    params: {
      name: subgraphName
    },
    id: 1
  })
}


export function removeGraph(subgraphName: string) {
  return axios.post(GRAPH_ADMIN_ENDPOINT, {
    jsonrpc: "2.0",
    method: "subgraph_remove",
    params: {
      name: subgraphName
    },
    id: 1
  })
}

export async function startGraph(provider: providers.JsonRpcProvider) {
  await execAsync('npm run build')
  await execAsync('npm run create-local')
  await execAsync('npm run deploy-local')

  await waitForGraphSync({
    subgraphName: 'adamazad/aqua',
    provider
  })
}

