import { writeFile, readFile } from 'fs/promises'
import type { providers } from 'ethers'
import { render } from 'mustache'
import axios from 'axios'

// EVM utils
import { getLastBlock } from './evm'
import { wait } from './time'

export interface BuildSubgraphYmlProps {
  network: string | 'mainnet' | 'ropsten' | 'rinkeby' | 'kovan' | 'local'
  startBlock: number
  contracts: {
    factory: {
      address: string
    }
    saleLauncher: {
      address: string
    }
    templateLauncher: {
      address: string
    }
  }
}

export async function buildSubgraphYaml(viewProps: BuildSubgraphYmlProps) {
  // Get the template
  const subgraphYamlTemplate = await readFile('./subgraph.template.yaml', {
    encoding: 'utf8'
  })

  const subgraphYamlOut = render(subgraphYamlTemplate, viewProps)

  // Write the file
  await writeFile('./subgraph.yaml', subgraphYamlOut)

  return
}

export async function queryGraph(query: string) {
  return (await axios.post('http://localhost:8000/index-node/graphql', { query })).data.data
}

export async function querySubgraph(subgraphName: string, query: string) {
  return (await axios.post(`http://localhost:8000/subgraphs/name/${subgraphName}`, { query })).data.data
}

interface WaitForGraphSyncParams {
  provider: providers.JsonRpcProvider
  targetBlockNumber?: number
  subgraphName: string
}

export async function waitForGraphSync({ provider, targetBlockNumber }: WaitForGraphSyncParams) {
  targetBlockNumber = targetBlockNumber || (await getLastBlock(provider)).number

  while (true) {
    try {
      await wait(100)
      const { data } = await axios.post('http://localhost:8030/graphql', {
        query: `{
    indexingStatusForCurrentVersion(subgraphName: "adamazad/aqua") {
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

      console.log(data)

      // if (currentVersionId === latestVersionId && latestEthereumBlockNumber == targetBlockNumber) break
    } catch (e) {
      // wrap header
    }
  }
}