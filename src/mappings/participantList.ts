import { ListInitialized, AmountsUpdated } from '../../generated/ParticipantList/ParticipantList'
import { ParticipantList, Participant } from '../../generated/schema'

/**
 * @todo Redesign this naming to:
 * Add participant
 * Remove participant
 * @param event
 */
export function handleAmountsUpdated(event: AmountsUpdated): void {}

/**
 * Pushes list of managers (addresses) to the ParticipantList entity
 * @param event
 */
export function handleListInitialized(event: ListInitialized): void {
  let participantList = new ParticipantList(event.address.toHexString())
  participantList.createdAt = event.block.timestamp.toI32()
  participantList.updatedAt = event.block.timestamp.toI32()
  // Map each participant address into a entity
  // then keep a reference for ParticipantList.participants
  let participants: string[] = []
  // Create a Participant for each address
  event.params.managers.forEach(manager => {
    // ID format: <ParticipantListAddress>/participants/<ManagerAddress>
    let participantId = event.address.toHexString() + '/participants/' + manager.toHexString()
    participants.push(participantId)
    let participant = new Participant(participantId)
    participant.createdAt = event.block.timestamp.toI32()
    participant.updatedAt = event.block.timestamp.toI32()
    participant.address = manager
    participant.save()
  })
  // Update the reference
  participantList.participants = participants
  participantList.save()
}
