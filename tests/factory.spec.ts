// Externals
import { providers } from 'ethers'
import Axios from 'axios'

// Helpers
import { buildSubgraphYaml, EVM_ENDPOINT, execAsync, getContractFactory, GRAPHQL_ENDPOINT, wait } from './helpers'

// Contracts
import { AuctionLauncher, MesaFactory, TemplateLauncher } from './helpers/contracts'
// Test block
describe('MesaFactory', () => {
  // Connect to local ganache instance
  const provider = new providers.JsonRpcProvider(EVM_ENDPOINT)

  // Wallets/Signers
  const deployer = provider.getSigner(0)

  // Contracts
  let mesaFactory: MesaFactory
  let auctionLauncher: AuctionLauncher
  let templateLauncher: TemplateLauncher

  // The Graph client
  const theGraph = Axios.create({
    baseURL: GRAPHQL_ENDPOINT,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  beforeEach(async () => {
    // Wait for everything to fire up
    await wait(10000)

    // Before each unit test, a new MesaFactory, TemplateLauncher, and AuctionLauncher EasyAuction contract is deployed to ganache
    // then followed by deploying its subgraph to the Graph node

    // Deploy MesaFactory
    mesaFactory = (await getContractFactory('MesaFactory', deployer).deploy()) as MesaFactory
    // Deploy TemplateLauncher
    templateLauncher = (await getContractFactory('TemplateLauncher', deployer).deploy(
      mesaFactory.address
    )) as TemplateLauncher
    // Deploy AuctionLauncher
    auctionLauncher = (await getContractFactory('AuctionLauncher', deployer).deploy(
      mesaFactory.address
    )) as AuctionLauncher

    // Prepare subgraph.yaml
    await buildSubgraphYaml({
      network: 'local',
      startBlock: mesaFactory.deployTransaction.blockNumber as number,
      contracts: {
        factory: {
          address: mesaFactory.address
        },
        auctionLauncher: {
          address: auctionLauncher.address
        },
        templateLauncher: {
          address: templateLauncher.address
        }
      }
    })

    // Initilize the Factory
    await mesaFactory.initalize(
      await deployer.getAddress(),
      await deployer.getAddress(),
      await deployer.getAddress(),
      templateLauncher.address,
      0, // zero fees
      0 // zero fees
    )

    // Build, create and deploy the subgraph
    await execAsync('npm run build')
    await execAsync('npm run create-local')
    await execAsync('npm run deploy-local')

    // Wait for subgraph to sync
    await wait(20000)
  })

  afterEach(async () => {
    // Clean up
    await execAsync('npm run remove-local')
  })

  test('Should return MesaFactory', async () => {
    const { data, status } = await theGraph.post(GRAPHQL_ENDPOINT, {
      query: `{
          mesaFactory (id: "MesaFactory") {
            address
            feeManager
            templateLauncher
          }
        }
      `
    })

    expect(status).toBe(200)
    expect(data.data.mesaFactory.address).toEqual(mesaFactory.address)
    expect(data.data.mesaFactory.feeManager).toEqual(await mesaFactory.feeManager())
    expect(data.data.mesaFactory.templateLauncher).toEqual(await mesaFactory.templateLauncher())
  })
})
