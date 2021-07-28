import { ListLaunched } from '../../generated/ParticipantListLauncher/ParticipantListLauncher'
import { ParticipantList } from '../../generated/templates'

/**
 * Start listening to new `ParticipantList` contract
 */
export function handleListLaunched(event: ListLaunched) {
  ParticipantList.create(event.params.participantList)
}
