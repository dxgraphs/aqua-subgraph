// Externals
import { ethers, providers } from 'ethers'
import { start as StartREPL } from 'repl'

// Contracts
import {
  AuctionLauncher,
  EasyAuction,
  ERC20,
  MesaFactory,
  TemplateLauncher,
  EasyAuctionTemplate
} from './tests/helpers/contracts'

// Helpers
import {
  buildSubgraphYaml,
  createBiddingAndAuctioningTokens,
  EVM_ENDPOINT,
  execAsync,
  getContractFactory,
  GRAPHQL_ENDPOINT,
  wait
} from './tests/helpers'
;(async () => {
  console.log(`Starting Docker`)

  await execAsync('npm run docker-up')

  // Wait for everything to fire up
  await wait(10000)

  // Connect to local ganache instance
  const provider = new providers.JsonRpcProvider(EVM_ENDPOINT)

  // Wallets/Signers
  const deployer = provider.getSigner(0)

  console.log(`Using ${await deployer.getAddress()} as deployer for contracts`)

  // Before each unit test, a new MesaFactory, TemplateLauncher, and AuctionLauncher EasyAuction contract is deployed to ganache
  // then followed by deploying its subgraph to the Graph node

  const weth = (await getContractFactory('ERC20Mintable', deployer).deploy('WETH', 'WETH')) as ERC20

  // Deploy MesaFactory
  const mesaFactory = (await getContractFactory('MesaFactory', deployer).deploy()) as MesaFactory
  // Deploy TemplateLauncher
  const templateLauncher = (await getContractFactory('TemplateLauncher', deployer).deploy(
    mesaFactory.address
  )) as TemplateLauncher
  // Deploy AuctionLauncher
  const auctionLauncher = (await getContractFactory('AuctionLauncher', deployer).deploy(
    mesaFactory.address
  )) as AuctionLauncher

  const buildSubgraphYamlConfig = {
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
  }

  console.log('Building subgraph.yaml using config')
  console.log(buildSubgraphYamlConfig)
  // Prepare subgraph.yaml
  await buildSubgraphYaml(buildSubgraphYamlConfig)

  // Build, create and deploy the subgraph
  console.log('Bulding subgraph')
  await execAsync('npm run build')

  console.log('Creating subgraph')
  await execAsync('npm run create-local')

  await wait(4000)

  console.log('Deploying subgraph')
  await execAsync('npm run deploy-local')

  // Wait for subgraph to sync
  await wait(20000)

  console.log('Initlizing the MesaFactory')
  // Initilize the Factory
  const mesaFactoryInitalizeTx = await mesaFactory.initalize(
    await deployer.getAddress(),
    await deployer.getAddress(),
    await deployer.getAddress(),
    templateLauncher.address,
    0, // zero fees
    0 // zero fees
  )
  console.log(`Factory initialized in block ${mesaFactoryInitalizeTx.blockNumber}; ${mesaFactoryInitalizeTx.blockHash}`)

  console.log('Deploying an EasyAuction Template contract')
  // Create factory for EasyAuction and deploy a new version
  const easyAuction = (await getContractFactory('EasyAuction', deployer).deploy()) as EasyAuction

  console.log('Register EasyAuction in AuctionLauncher')
  // Register EasyAuction in AuctionLauncher
  const auctionLaunch1 = await auctionLauncher.addTemplate(easyAuction.address)
  const auctionLaunch1Receipt = await auctionLaunch1.wait(1)
  // Get the EasyAuction TemplateId
  const easyAuctionTemplateId = auctionLaunch1Receipt.events?.[0]?.args?.templateId

  const easyAuctionTemplate = (await getContractFactory('EasyAuctionTemplate', deployer).deploy(
    weth.address,
    auctionLauncher.address,
    easyAuctionTemplateId
  )) as EasyAuctionTemplate

  // Register EasyAuctionTemplate on TemplateLauncher
  const addTemplateEasyAuctionTx = await templateLauncher.addTemplate(easyAuctionTemplate.address)

  console.log(
    `EasyAuctionTemplate registered in block ${addTemplateEasyAuctionTx.blockNumber}; ${addTemplateEasyAuctionTx.blockHash}`
  )

  const { auctioningToken, biddingToken } = await createBiddingAndAuctioningTokens(deployer)

  console.log(`Deployed auctioningToken at ${auctioningToken.address}`)
  console.log(`Deployed biddingToken at ${biddingToken.address}`)

  // await mesaFactory.launchTemplate(easyAuctionTemplateId, encodeInitData(

  // ))

  console.log(`Subgraph ready at ${GRAPHQL_ENDPOINT}`)

  console.log(
    `You can access ${['mesaFactory', 'templateLauncher', 'auctionLauncher', 'helpers', 'templates'].join(', ')}`
  )

  // Attach contracts to the REPL context
  // Allow use to access contracts
  const replInstance = StartREPL({
    preview: true,
    useColors: true,
    prompt: `Mesa > `
  })

  replInstance.context.mesaFactory = mesaFactory
  replInstance.context.templateLauncher = templateLauncher
  replInstance.context.auctionLauncher = auctionLauncher
  replInstance.context.helpers = require('./tests/helpers')
  replInstance.context.templates = {
    easyAuctionTemplate
  }
})()

export function encodeInitData(
  tokenOut: string,
  tokenIn: string,
  duration: string,
  tokenOutSupply: string,
  minPrice: string,
  minBuyAmount: string,
  minRaise: string
) {
  return ethers.utils.defaultAbiCoder.encode(
    ['address', 'address', 'uint256', 'uint256', 'uint96', 'uint96', 'uint256'],
    [tokenOut, tokenIn, duration, tokenOutSupply, minPrice, minBuyAmount, minRaise]
  )
}
