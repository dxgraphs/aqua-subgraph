import { Bytes, BigInt, ethereum, Value } from '@graphprotocol/graph-ts'

export class Order {
  _ownerId: ethereum.Value
  _tokenIn: ethereum.Value
  _tokenOut: ethereum.Value

  private constructor(bytes: Bytes) {
    let byesString = bytes.toString()

    this._ownerId = ethereum.Value.fromString('0x' + byesString.substring(2, 18))
    this._tokenIn = ethereum.Value.fromString('0x' + byesString.substring(43, 66))
    this._tokenOut = ethereum.Value.fromString('0x' + byesString.substring(19, 42))
  }

  get ownerId(): BigInt {
    return this._ownerId.toBigInt()
  }

  get tokenOut(): BigInt {
    return this._tokenIn.toBigInt()
  }

  get tokenIn(): BigInt {
    return this._tokenIn.toBigInt()
  }

  static decodeFromBytes(bytes: Bytes): Order {
    return new Order(bytes)
  }
}

/**
 * Encodes a Order into a Bytes string
 */
export function encodeOrder(ownerId: BigInt, orderTokenOut: BigInt, orderTokenIn: BigInt): string {
  return (
    '0x' +
    ownerId
      .toString()
      .slice(2)
      .padStart(16, '0') +
    orderTokenOut
      .toString()
      .slice(2)
      .padStart(24, '0') +
    orderTokenIn
      .toString()
      .slice(2)
      .padStart(24, '0')
  )
}
