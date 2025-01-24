use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{Transaction}
use crowdfunding/types.{CampaignDatum, ConfigDatum}
use crowdfunding/utils

validator state_token_script(platform: VerificationKeyHash) {
  spend(datum: Option<Data>, _redeemer, _oref, tx: Transaction) {
    expect Some(datum) = datum
    if datum is campaign_datum: CampaignDatum {
      or {
        ([platform] == tx.extra_signatories)?,
        ([campaign_datum.creator.1st] == tx.extra_signatories)?,
      }
    } else if datum is config_datum: ConfigDatum {
      utils.atleast_signedby(tx.extra_signatories, config_datum.multisig)
    } else {
      True
    }
  }

  else(_) {
    fail
  }
}
