import { Bytes, log } from '@graphprotocol/graph-ts'
import { ListInitialized, AmountsUpdated } from '../../generated/templates/ParticipantList/ParticipantList'
import { ParticipantList, Participant } from '../../generated/schema'

/**
 * @todo Redesign this naming to:
 * 1. Add participant
 * 2. Remove participant
 * @todo Update AmountsUpdated. See https://github.com/cryptonative-ch/mesa-smartcontracts/issues/112
 *
 */
export function handleAmountsUpdated(event: AmountsUpdated): void {
  // Create and save Participant entity
  let participant = new Participant(event.address.toHexString() + '/participants/' + event.address.toHexString())
  participant.createdAt = event.block.timestamp.toI32()
  participant.updatedAt = event.block.timestamp.toI32()
  participant.address = event.params.account
  participant.amount = event.params.amounts
  // Update parent entity refere
  participant.participantList = event.address.toHexString()
  participant.save()
  // Push participant to list
  // Ignore linting
  // @ts-ignore
}

/**
 * Creates a `ParticipantList` entity
 *
 * Pushes list of managers (addresses) to the ParticipantList entity directly
 */
export function handleListInitialized(event: ListInitialized): void {
  let participantList = new ParticipantList(event.address.toHexString())
  participantList.createdAt = event.block.timestamp.toI32()
  participantList.updatedAt = event.block.timestamp.toI32()
  // Address of the contract
  participantList.address = event.address
  // Managers list does not need a new entity.
  // Start with a default list
  let managers: Bytes[] = []
  // Clousure isn't supported here, hence `Array.forEach` does not work
  // the seoncd best option without too many math was for loop, with a catch
  let manager = event.params.managers.shift() || null
  for (let i = 0; i < event.params.managers.length; i++) {
    if (manager != null) {
      managers.push(manager)
      // Move cursor
      manager = event.params.managers.shift() || null
    }
  }
  // Add list of managers
  participantList.managers = managers
  // Start with an empty list
  participantList.save()
}
