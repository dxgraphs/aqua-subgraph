import { Bytes, BigInt } from '@graphprotocol/graph-ts'

export class Order {
  _ownerId: BigInt
  _tokenIn: BigInt
  _tokenOut: BigInt

  private constructor(bytes: Bytes) {
    let byesString = bytes.toString()
    this._ownerId = BigInt.fromI32(Bytes.fromHexString('0x' + byesString.substring(2, 18)).toI32())
    this._tokenIn = BigInt.fromI32(Bytes.fromHexString('0x' + byesString.substring(43, 66)).toI32())
    this._tokenOut = BigInt.fromI32(Bytes.fromHexString('0x' + byesString.substring(19, 42)).toI32())
  }

  get ownerId(): BigInt {
    return this._ownerId
  }

  get tokenOut(): BigInt {
    return this._tokenIn
  }

  get tokenIn(): BigInt {
    return this._tokenIn
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
