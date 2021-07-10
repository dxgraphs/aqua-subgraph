import { MesaLog } from '../../generated/schema'
/**
 * Checks if value is equal to zero
 */
export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function logToMesa(content: string): void {
  let log = new MesaLog(content)
  log.content = content
  log.save()
}
