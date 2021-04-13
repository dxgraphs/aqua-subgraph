import { BigNumber } from '@ethersproject/bignumber'

export interface TemplateAdded {
  template: string
  templateId: BigNumber
}

export interface NewPurchase {
  buyer: string
  amount: BigNumber
}
