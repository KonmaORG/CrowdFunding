use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}
use crowdfunding/types.{CampaignDatum, ConfigDatum}
use crowdfunding/utils

validator state_token_script(config_nft: PolicyId) {
  spend(datum: Option<Data>, _redeemer, _oref, tx: Transaction) {
    expect Some(datum) = datum
    if datum is campaign_datum: CampaignDatum {
      let ConfigDatum { multisig, .. } =
        utils.ref_inputs_to_config_datum(tx.reference_inputs, config_nft)
      or {
        utils.atleast_signedby(tx.extra_signatories, multisig)?,
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
