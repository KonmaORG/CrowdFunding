use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{Transaction}
use crowdfunding/types.{CampaignDatum}

validator state_token_script(platform: VerificationKeyHash) {
  spend(datum: Option<CampaignDatum>, _redeemer, _oref, tx: Transaction) {
    expect Some(datum) = datum
    or {
      ([platform] == tx.extra_signatories)?,
      ([datum.creator.1st] == tx.extra_signatories)?,
    }
  }

  else(_) {
    fail
  }
}
