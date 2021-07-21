import { AmountsUpdated } from '../../generated/ParticipantList/ParticipantList'
import { FixedPriceSaleParticipant, FixedPriceSaleParticipantList } from '../../generated/schema'

export function handleAmountsUpdated(event: AmountsUpdated): void {
    let participantList = FixedPriceSaleParticipantList.load(event.address.toHexString())

    // event comes from list not associated with any registered sale
    if (!participantList) {
        return
    }

    let fixedPriceSaleParticipant = FixedPriceSaleParticipant.load(event.params.account.toHexString())

    // Create new participant if not existing
    if (!fixedPriceSaleParticipant) {
        fixedPriceSaleParticipant = new FixedPriceSaleParticipant(event.params.account.toHexString())
        fixedPriceSaleParticipant.createdAt = event.block.timestamp.toI32()
        fixedPriceSaleParticipant.address = event.params.account
        fixedPriceSaleParticipant.sale = participantList.sale
    }

    fixedPriceSaleParticipant.amount = event.params.amounts
    fixedPriceSaleParticipant.updatedAt = event.block.timestamp.toI32()

    fixedPriceSaleParticipant.save()
}