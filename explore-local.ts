// Externals
import { BigNumber, BigNumberish, providers, utils } from 'ethers'
import { start as StartREPL } from 'repl'

// Contracts
import {
  ERC20,
  FairSale,
  FairSaleTemplate,
  FairSaleTemplate__factory,
  MesaFactory,
  SaleLauncher,
  TemplateLauncher
} from './tests/helpers/contracts'

const ONE_MINUTE = 60
const ONE_HOUR = ONE_MINUTE * 60

// Helpers
import {
  createTokenAndMintAndApprove,
  encodeInitDataFairSale,
  getContractFactory,
  buildSubgraphYaml,
  getSigners,
  execAsync,
  wait,
  GRAPHQL_ENDPOINT,
  EVM_ENDPOINT
} from './tests/helpers'
;(async () => {
  console.log(`Starting Docker`)

  await execAsync('npm run docker-up')

  // Wait for everything to fire up
  await wait(10000)

  // Connect to local ganache instance
  const provider = new providers.JsonRpcProvider(EVM_ENDPOINT)

  // Wallets/Signers
  const [deployer, saleCreator, saleInvestorA, saleInvestorB] = getSigners(provider)

  console.table([
    {
      address: await deployer.getAddress(),
      description: 'Contracts Deployer'
    },
    {
      address: await saleCreator.getAddress(),
      description: 'Sale (IDO) Creator'
    },
    {
      address: await saleInvestorA.getAddress(),
      description: 'Sale Investor'
    },
    {
      address: await saleInvestorB.getAddress(),
      description: 'Sale Investor'
    }
  ])

  // Before each unit test, a new MesaFactory, TemplateLauncher, and AuctionLauncher FairSale contract is deployed to ganache
  // then followed by deploying its subgraph to the Graph node

  const weth = (await getContractFactory('ERC20Mintable', deployer).deploy('WETH', 'WETH')) as ERC20

  // Deploy MesaFactory
  const mesaFactory = (await getContractFactory('MesaFactory', deployer).deploy()) as MesaFactory
  // Deploy TemplateLauncher
  const templateLauncher = (await getContractFactory('TemplateLauncher', deployer).deploy(
    mesaFactory.address
  )) as TemplateLauncher
  // Deploy AuctionLauncher
  const saleLauncher = (await getContractFactory('SaleLauncher', deployer).deploy(mesaFactory.address)) as SaleLauncher

  const buildSubgraphYamlConfig = {
    network: 'local',
    startBlock: mesaFactory.deployTransaction.blockNumber as number,
    contracts: {
      factory: {
        address: mesaFactory.address
      },
      saleLauncher: {
        address: saleLauncher.address
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
  await execAsync('npm run codegen')
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
    await deployer.getAddress(), // Fee Manager
    await deployer.getAddress(), // Fee Collector; treasury
    await deployer.getAddress(), // Template Manager: can add/remove/verify Sale Templates
    templateLauncher.address, // TemplateLauncher address
    0, // Template fee: cost to submit a new Sale Template to the Mesa Factory
    0, // zero sale fees
    0 // zero fees
  )

  console.log(`Factory initialized in block ${mesaFactoryInitalizeTx.blockNumber}; ${mesaFactoryInitalizeTx.blockHash}`)

  console.log('Deploying an FairSale Template contract')
  // Create factory for FairSale and deploy a new version
  const fairSaleBaseContract = (await getContractFactory('FairSale', deployer).deploy()) as FairSale

  console.log('Register FairSale in AuctionLauncher')
  // Register FairSale in SaleLauncher
  const auctionLaunch1 = await saleLauncher.addTemplate(fairSaleBaseContract.address)
  const auctionLaunch1Receipt = await auctionLaunch1.wait(1)
  // Get the FairSale TemplateId
  const FAIR_SALE_TEMPLATE_ID = auctionLaunch1Receipt.events?.[0]?.args?.templateId

  console.log({
    FAIR_SALE_TEMPLATE_ID: FAIR_SALE_TEMPLATE_ID.toString()
  })
  const fairSaleTemplate = (await getContractFactory('FairSaleTemplate', deployer).deploy()) as FairSaleTemplate

  // Register FairSaleTemplate on TemplateLauncher
  const addTemplateFairSaleTx = await templateLauncher.addTemplate(fairSaleTemplate.address)

  console.log(
    `FairSaleTemplate registered in block ${addTemplateFairSaleTx.blockNumber}; ${addTemplateFairSaleTx.blockHash}`
  )

  const auctioningToken = await createTokenAndMintAndApprove({
    name: 'AuctioningToken',
    symbol: 'AT',
    addressToApprove: saleLauncher.address,
    numberOfTokens: utils.parseEther('1000'),
    users: [saleCreator],
    signer: saleCreator
  })

  // Deploying
  const biddingToken = await createTokenAndMintAndApprove({
    name: 'BiddingToken',
    symbol: 'BT',
    addressToApprove: saleLauncher.address,
    numberOfTokens: utils.parseEther('100'),
    users: [saleCreator, saleInvestorA, saleInvestorB],
    signer: deployer
  })

  console.log(
    `Deployed ${await auctioningToken.name()} ($${await auctioningToken.symbol()}) at ${auctioningToken.address}`
  )
  console.log(`Deployed ${await biddingToken.name()} at ($${await biddingToken.symbol()}) ${biddingToken.address}`)

  console.log({
    duration: BigNumber.from(ONE_HOUR), // auction lasts for one hour
    minBuyAmount: utils.parseEther('10'), // Each order's bid must be at least 10
    minPrice: utils.parseEther('5'), // Minimum price per token
    minRaise: utils.parseEther('100000'), // 100k DAI
    saleLauncher: saleLauncher.address,
    saleTemplateId: BigNumber.from(1),
    tokenIn: biddingToken.address,
    tokenOut: auctioningToken.address,
    tokenOutSupply: utils.parseEther('1'),
    tokenSupplier: await saleCreator.getAddress()
  })
  const luanchTemplateTx = await mesaFactory.launchTemplate(
    1,
    encodeInitDataFairSale({
      duration: BigNumber.from(ONE_HOUR), // auction lasts for one hour
      minBuyAmount: utils.parseEther('10'), // Each order's bid must be at least 10
      minPrice: utils.parseEther('5'), // Minimum price per token
      minRaise: utils.parseEther('100000'), // 100k DAI
      saleLauncher: saleLauncher.address,
      saleTemplateId: BigNumber.from(1),
      tokenIn: biddingToken.address,
      tokenOut: auctioningToken.address,
      tokenOutSupply: utils.parseEther('1'),
      tokenSupplier: await saleCreator.getAddress()
    })
  )

  const luanchTemplateTxConfirmation = await luanchTemplateTx.wait(1)

  if (luanchTemplateTxConfirmation.events) {
    console.log(luanchTemplateTxConfirmation.events)
    const launchedTemplateAddress = luanchTemplateTxConfirmation?.events[0]?.args?.template
    console.log(`Launched a new FairSaleTemplate at ${launchedTemplateAddress}`)

    // Connect to the Template and create the sale
    const saleTemplate = FairSaleTemplate__factory.connect(launchedTemplateAddress, saleCreator)

    try {
      const createSaleTx = await saleTemplate.createSale({
        value: utils.parseEther('1')
      })
      console.log(await createSaleTx.wait(1))
    } catch (e) {
      console.log(`createSale failed: `, JSON.parse(e.body))
    }
  }

  // Add one bid to
  console.log(`Subgraph ready at ${GRAPHQL_ENDPOINT}`)

  console.log(
    `You can access ${['mesaFactory', 'templateLauncher', 'saleLauncher', 'helpers', 'templates'].join(', ')}`
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
  replInstance.context.saleLauncher = saleLauncher
  replInstance.context.helpers = require('./tests/helpers')
  replInstance.context.templates = {
    fairSaleTemplate
  }
})()

function printWei(bigNumber: string): string {
  return utils.parseUnits(bigNumber).toString()
}
