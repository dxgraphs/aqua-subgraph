import type { providers } from 'ethers'

/**
 * Gets the first 10 signers
 * @param provider
 */
export function getSigners(provider: providers.JsonRpcProvider): providers.JsonRpcSigner[] {
  const signers: providers.JsonRpcSigner[] = []

  for (let index = 0; index < 10; index++) {
    signers.push(provider.getSigner(index))
  }

  return signers
}

/**
 * Advances EVNM block timestamp to a custom one
 */
export function increaseBockTimestamp(provider: providers.JsonRpcProvider, timestamp: number) {
  return provider.send('evm_increaseTime', [timestamp])
}

export async function mineBlock(provider: providers.JsonRpcProvider, timestamp: number): Promise<void> {
  provider.send('evm_mine', [timestamp])
}

export async function increaseTime(provider: providers.JsonRpcProvider, duration: number): Promise<void> {
  provider.send('evm_increaseTime', [duration])
  provider.send('evm_mine', [])
}

/**
 * Gets the last block from passed provider
 */
export async function getLastBlock(provider: providers.Provider) {
  return provider.getBlock(await provider.getBlockNumber())
}
