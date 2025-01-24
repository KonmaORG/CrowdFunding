use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{Transaction}
use crowdfunding/types.{CampaignDatum, Multisig}

validator state_token_script(platform: VerificationKeyHash) {
  spend(datum: Option<Data>, _redeemer, _oref, tx: Transaction) {
    expect Some(datum) = datum
    if datum is campaign_datum: CampaignDatum {
      or {
        ([platform] == tx.extra_signatories)?,
        ([campaign_datum.creator.1st] == tx.extra_signatories)?,
      }
    } else if datum is multisig: Multisig {
      True
    } else {
      True
    }
  }

  else(_) {
    fail
  }
}
