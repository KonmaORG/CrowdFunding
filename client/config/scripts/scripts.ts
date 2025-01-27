import { applyDoubleCborEncoding, Validator } from '@lucid-evolution/lucid'

import { karbonstore_karbonstore_spend } from './plutus'

const identificationNFT_Mint = applyDoubleCborEncoding(
  karbonstore_karbonstore_spend
)

export const KarbonStoreValidator: Validator = {
  type: 'PlutusV3',
  script: identificationNFT_Mint,
}
