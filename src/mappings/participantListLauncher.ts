import { ListLaunched } from '../../generated/ParticipantListLauncher/ParticipantListLauncher'
import { ParticipantList } from '../../generated/templates'

/**
 * Start listening to new `ParticipantList` contract
 */
export function handleListLaunched(event: ListLaunched): void {
  ParticipantList.create(event.params.participantList)
}
