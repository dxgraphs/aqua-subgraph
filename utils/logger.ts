import { getLogger as getLoggerBase } from 'log4js'

export enum Namespace {
  SUBGRAPH = 'Subgraph',
  CONTRACTS = 'Contracts',
  EVM = 'EVM'
}

export const getLogger = (namespace: Namespace) => getLoggerBase(namespace)
