import { Bytes, log } from '@graphprotocol/graph-ts'
import { ListInitialized, AmountsUpdated } from '../../generated/ParticipantList/ParticipantList'
import { ParticipantList, Participant } from '../../generated/schema'

/**
 * @todo Redesign this naming to:
 * 1. Add participant
 * 2. Remove participant
 *
 * @todo Update AmountsUpdated. See https://github.com/cryptonative-ch/mesa-smartcontracts/issues/112
 *
 */
export function handleAmountsUpdated(event: AmountsUpdated): void {
  // Get the parent ParticipantList entity
  let participantList = new ParticipantList(event.address.toHexString())
  if (!participantList) {
    return
  }
  // Create and save Participant entity
  let participant = new Participant(event.address.toHexString() + '/participants/' + event.address.toHexString())
  participant.createdAt = event.block.timestamp.toI32()
  participant.updatedAt = event.block.timestamp.toI32()
  participant.address = event.params.account
  /**
   */
  participant.amount = event.params.amounts
  participant.save()
  // Push participant to list
  // Linting will say object is undefined, but ignore it
  // @ts-ignore
  participantList.participants.push(participant.id)
  participantList.save()
}

/**
 * Pushes list of managers (addresses) to the ParticipantList entity
 */
export function handleListInitialized(event: ListInitialized): void {
  let participantList = new ParticipantList(event.address.toHexString())
  participantList.createdAt = event.block.timestamp.toI32()
  participantList.updatedAt = event.block.timestamp.toI32()
  // Start with a default list
  let managers: Bytes[] = []
  // Clousure isn't supported here, hence `Array.forEach` does not work
  // the seoncd best option without too many math was for loop, with a catch
  let manager = event.params.managers.shift() || null
  for (let i = 0; i < event.params.managers.length; i++) {
    if (manager != null) {
      log.debug('Manager address is {}', [manager.toHexString()])
      managers.push(manager)
      // Move cursor
      manager = event.params.managers.shift() || null
    }
  }
  // Add list of managers
  participantList.managers = managers
  // Start with an empty list
  participantList.participants = []
  participantList.save()
}
