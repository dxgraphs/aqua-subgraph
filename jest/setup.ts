import { AxiosResponse } from 'axios'
import { providers } from 'ethers'
import {
  AquaFactory,
  SaleLauncher,
  TemplateLauncher,
  AquaFactory__factory,
  SaleLauncher__factory,
  ParticipantList__factory,
  TemplateLauncher__factory,
  ParticipantListLauncher__factory
} from '@dxdao/aqua-sc'
// Contract types
import {
  execAsync,
  EVM_ENDPOINT,
  buildSubgraphYaml,
  startGraph,
  waitForSubgraphUp,
  getLogger,
  Namespace,
  querySubgraph,
  SUBGRAPH_NAME,
  waitForGraphSync
} from '../utils'

const logger = getLogger(Namespace.CONTRACTS)
logger.level = 'info'

export async function aquaJestBeforeAll() {
  await waitForSubgraphUp()
}

export async function aquaJestBeforeEach() {
  const provider = new providers.JsonRpcProvider(EVM_ENDPOINT)

  logger.info('Deploying contracts...')

  // Wallets/Signers
  const deployer = provider.getSigner(0)
  const deployerAddress = await deployer.getAddress()

  // Deploy framework core contracts
  const aquaFactory = await new AquaFactory__factory(deployer).deploy(
    deployerAddress, // Fee Manager
    deployerAddress, // FeeTo
    deployerAddress, // TemplateManager
    0, // TemplateFee
    0, // FeeNumerator
    0 // SaleFee
  )
  const participantList = await new ParticipantList__factory(deployer).deploy()
  const participantListLauncher = await new ParticipantListLauncher__factory(deployer).deploy(
    aquaFactory.address,
    participantList.address
  )
  const templateLauncher = await new TemplateLauncher__factory(deployer).deploy(
    aquaFactory.address,
    participantListLauncher.address
  )
  const saleLauncher = await new SaleLauncher__factory(deployer).deploy(aquaFactory.address)

  // Attach templateLauncher to factory
  await aquaFactory.setTemplateLauncher(templateLauncher.address)

  logger.info('OK')
  // Prepare subgraph.yaml
  await buildSubgraphYaml({
    network: 'local',
    startBlock: aquaFactory.deployTransaction.blockNumber as number,
    contracts: {
      aquaFactory: {
        address: aquaFactory.address
      },
      saleLauncher: {
        address: saleLauncher.address
      },
      templateLauncher: {
        address: templateLauncher.address
      },
      participantListLauncher: {
        address: participantListLauncher.address
      }
    }
  })

  // Build, create and deploy the subgraph
  await startGraph(provider)

  logger.info('Setup complete')

  // Add to context
  return {
    waitForSubgraphSync: (targetBlockNumber?: number) =>
      waitForGraphSync({
        provider,
        subgraphName: SUBGRAPH_NAME,
        targetBlockNumber
      }),
    querySubgraph: (query: string) => querySubgraph(SUBGRAPH_NAME, query),
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
  querySubgraph: (query: string) => Promise<AxiosResponse>
  waitForSubgraphSync: (targetBlockNumber?: number) => Promise<void>
  aquaFactory: AquaFactory
  saleLauncher: SaleLauncher
  templateLauncher: TemplateLauncher
}
