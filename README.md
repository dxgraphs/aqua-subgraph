# Mesa Subgraph

Mesa Subgraph is the main provider for Mesa Interface data.

# Explore

You can explore the subgraph at [The Graph Explorer](https://thegraph.com/explorer/subgraph/adamazad/mesa).

## Local

If you wish to deploy a local explorer, run:

```bash
$ npm run explore-local
```

# Installation

Install dependencies using `yarn`

```bash
$ yarn install
```

# Architecture

**Fixed Contracts**

The subgraph listens for events from three fixed contracts; they are deployed once:

1. `MesaFactory`
2. `SaleLauncher`
3. `TemplateLauncher`

**Dynamic Contracts**

These contracts are deployed from the factory for every new sale. Their address is resolved from `Event.address` and compared against `MesaFactory.allSales` array. If the address does not belong to Mesa's sale, the handler exits:

1. `FairSale`
2. `FixedPriceSale`

## Contracts

### `MesaFactory`

<sub>[`src/mappings/factory.ts`](src/mappings/factory.ts)</sub>

#### 1. `FactoryInitialized` from `MesaFactory.initialize`

```typescript
interface FactoryInitialized {
  feeManager: Address // Address of the fee manager
  feeTo: Address // Address of fees collector
  templateManager: Address // Address of template manager
  templateLauncher: Address // Address of TemplateLauncher  contract
  templateFee: number // Template fee
  feeNumerator: number // Fee numerator; because Solidity
  saleFee: number // A fixed sale fee paid to Mesa
}
```

#### 2. `SetFeeManager` from `MesaFactory.setFeeManager`

```typescript
interface SetFeeManager {
  feeManager: Address
}
```

#### 3. `SetFeeNumerator` from `MesaFactory.setFeeNumerator`

```typescript
interface SetFeeNumerator {
  feeNumerator: Address
}
```

#### 4. `SetFeeTo` from `MesaFactory.setFeeTo`

```typescript
interface SetFeeTo {
  feeTo: Address
}
```

#### 5. `SetSaleFee` from `MesaFactory.setSaleFee`

```typescript
interface SetSaleFee {
  saleFee: number
}
```

#### 6. `SetTemplateFee` from `MesaFactory.setTemplateFee`

```typescript
interface SetTemplateFee {
  templateFee: number
}
```

#### 7. `SetTemplateLauncher` from `MesaFactory.setTemplateLauncher`

```typescript
interface SetTemplateLauncher {
  templateLauncher: Address
}
```

#### 8. `SetTemplateManager` from `MesaFactory.setTemplateManager`

```typescript
interface SetTemplateManager {
  templateManager: Address
}
```

### `SaleLauncher`

<sub>[`src/mappings/saleLauncher.ts`](src/mappings/saleLauncher.ts)</sub>

#### 1. `SaleInitialized` from `SaleLauncher.createSale`

```typescript
interface SaleInitialized {
  sale: Address // Address of new Sale contract
  templateId: number // The template used to create the sale
  data: Bytes // Details of the sale as Bytes.
}
```

`templateId` is used to determine GraphQL schema -- either `FairSale` or `FixedPriceSale` -- to create. `sale` address is the address of the newly deploed sale contract.

### `TemplateLauncher`

<sub>[`src/mappings/templateLauncher.ts`](src/mappings/templateLauncher.ts)</sub>

#### 1.`TemplateLaunched` from `TemplateLauncher.launchTemplate`

```typescript
interface TemplateLaunched {
  sale: string // Address of the new *-Sale contract
  templateId: string // Index of the template
}
```

#### 2.`TemplateAdded` from `TemplateLauncher.addTemplate`

```typescript
interface TemplateAdded {
  template: Address // Address of new Template contract
  templateId: number // Index of the template
}
```

#### 3.`TemplateRemoved` from `TemplateLauncher.removeTemplate`

Handles removing templates

```typescript
interface TemplateRemoved {
  template: Address // Address of new Template contract
  templateId: number // Index of the template
}
```

#### 4.`TemplateVerified` from `TemplateLauncher.verifyTemplate`

Handles verifying templates - `TemplateVerified`

```typescript
interface TemplateVerified {
  template: Address // Address of new Template contract
  templateId: string // Index of the template
}
```

### `FairSale`

<sub>[`src/mappings/sales/easySale.ts`](src/mappings/sales/fairSale.ts)

#### 1. `SaleCleared` from `FairSale.clearSale`

```typescript
interface SaleCleared {
  // No params
}
```

#### 2. `NewOrder` from `FairSale.newOrder`

```typescript
interface NewOrder {
  ownerId: number
  orderTokenOut: number
  orderTokenIn: number
}
```

### `FixedPriceSale`

<sub>[`src/mappings/sales/fixedPriceSale.ts`](src/mappings/sales/fixedPriceSale.ts)</sub>

#### 1. `SaleClosed` from `FixedPriceSale.closeSale`

```typescript
interface SaleClosed {
  // No params
}
```

#### 2. `NewPurchase` from `FixedPriceSale.buyTokens`

```typescript
interface NewPurchase {
  amount: number // Amount purchased
  buyer: Address // EOA
}
```

## GraphQL Entities

These entities are available in the subgraph. Schemas are in [`schema.graphql`](schema.graphql)

### MesFactory

One entity to retrieve information about the factory

### FairSale

All sales of type FairSale.

### FairSaleBid

All bids on FairSale sales.

### FixedPriceSale

All sales of type `FixedPriceSale`

### FixedPriceSalePurchase

All sales of type `FixedPriceSale`

### SaleTemplate

Registered sale mechansims in `TemplateLauncher` contract.

### Token

Stores information about ERC20 tokens that interact with Mesa contracts.

# Deployment

## Set up config file

Each network deployment requires setting up a JSON configuration file in `config/<NetworkName>.json`. For instance, for Rinkeby, the file

## Prepare `subgraph.yaml`

`subgraph.yaml` is built from `subgraph.template.yaml` using configuration defined in previous section. To do so, run

```bash
$ npm run prepare:<NetworkName>
```

Current available networks are Mainnet and Rinkeby.

## Deploy to The Graph

Read documentations for [installing The Graph CLI](https://thegraph.com/docs/quick-start#3.-initialize-a-new-subgraph), then run

```bash
$ npm run deploy
```

# Build ABIs

ABIs for main contracts are not included in the repo. Instead, they are extracted from the smart contract repo ([cryptonative-ch/mesa-smartcontracts](https://github.com/cryptonative-ch/mesa-smartcontracts)). To build the ABIs, run:

```bash
$ ./build-abis.sh
```

Note that it requires [`jq`](https://stedolan.github.io/jq/) tool.

# Tests

Tests require [Docker](http://docker.com/) installed. To run tests, run

```bash
$ yarn tests
```

# Scripts

This projects comes with a set of predefined scripts in `package.json`

| Script            | Description                                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `test`            | Runs Jest tests                                                                                                                                                                                   |
| `docker-up`       | Runs Docker services defined in `docker-compose.yaml`                                                                                                                                             |
| `prepare-mainnet` | Builds `subgraph.yaml` for the mainnet                                                                                                                                                            |
| `prepare-testnet` | Builds `subgraph.yaml` for the Rinkeby testnet                                                                                                                                                    |
| `codegen`         | Generates AssemblyScript types for smart contract ABIs and the subgraph schema.                                                                                                                   |
| `build`           | Runs `graph build` to compile a subgraph to WebAssembly.                                                                                                                                          |
| `deploy`          | Deploys the subgraph build to a The Graph Node. Requires a valid access token from the dashbaord. See [`graph auth`](https://github.com/graphprotocol/graph-cli#the-graph-command-line-interface) |
| `typechain`       | Creates typed-contracts classes.                                                                                                                                                                  |
| `build-abis`      | Extracts contract ABIs from artifacts in `artifacts` directory.                                                                                                                                   |
| `deploy-local`    | Deploys the graph build to local graph-node.                                                                                                                                                      |
| `create-local`    | Creates the graph build in local graph-node.                                                                                                                                                      |
| `remove-local`    | Removes the graph build from local graph-node.                                                                                                                                                    |
| `explore-local`   | Starts local graph explorer.                                                                                                                                                                      |
