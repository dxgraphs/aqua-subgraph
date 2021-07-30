import { upAll as upDockerCompose } from 'docker-compose'
import axios, { AxiosResponse } from 'axios'
import { providers } from 'ethers'

// Contract types
import {
  buildSubgraphYaml,
  EVM_ENDPOINT,
  execAsync,
  getContractFactory,
  GRAPHQL_ENDPOINT,
  wait
} from '../utils'
import {
  AquaFactory,
  SaleLauncher,
  TemplateLauncher
} from '../utils/typechain-contracts'

export async function aquaJestBeforeEach(): Promise<AquaJestBeforeEachContext> {
  await upDockerCompose()
  // Connect to local ganache instance
  const provider = new providers.JsonRpcProvider(EVM_ENDPOINT)
  // Wallets/Signers
  const deployer = provider.getSigner(0)
  // Before each unit test, a new AquaFactory, TemplateLauncher, and AuctionLauncher EasyAuction contract is deployed to ganache
  // then followed by deploying its subgraph to the Graph node
  // Deploy AquaFactory
  const aquaFactory = (await getContractFactory('AquaFactory', deployer).deploy()) as AquaFactory
  // Deploy TemplateLauncher
  const templateLauncher = (await getContractFactory('TemplateLauncher', deployer).deploy(
    aquaFactory.address
  )) as TemplateLauncher
  // Deploy AuctionLauncher
  const saleLauncher = (await getContractFactory('SaleLauncher', deployer).deploy(aquaFactory.address)) as SaleLauncher

  // Prepare subgraph.yaml
  await buildSubgraphYaml({
    network: 'local',
    startBlock: aquaFactory.deployTransaction.blockNumber as number,
    contracts: {
      factory: {
        address: aquaFactory.address
      },
      saleLauncher: {
        address: saleLauncher.address
      },
      templateLauncher: {
        address: templateLauncher.address
      }
    }
  })

  // Initilize the Factory
  await aquaFactory.initialize(
    await deployer.getAddress(), // Fee Manager
    await deployer.getAddress(), // Fee Collector; treasury
    await deployer.getAddress(), // Template Manager: can add/remove/verify Sale Templates
    templateLauncher.address, // TemplateLauncher address
    0, // Template fee: cost to submit a new Sale Template to the Aqua Factory
    0, // zero sale fees
    0 // zero fees
  )

  // The Graph client
  const fetchFromTheGraph = (query: string) => {
    return axios.post(
      GRAPHQL_ENDPOINT,
      {
        query
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  // Build, create and deploy the subgraph
  await execAsync('npm run build')
  await execAsync('npm run create-local')
  await execAsync('npm run deploy-local')
  // Wait for subgraph to sync
  await wait(5000)
  // Add to context
  return {
    fetchFromTheGraph,
    provider,
    aquaFactory,
    saleLauncher,
    templateLauncher
  }
}

export async function aquaJestAfterEach() {
  await execAsync('npm run remove-local')
}

export interface AquaJestBeforeEachContext {
  provider: providers.JsonRpcProvider
  fetchFromTheGraph: (query: string) => Promise<AxiosResponse>
  aquaFactory: AquaFactory
  saleLauncher: SaleLauncher
  templateLauncher: TemplateLauncher
}
