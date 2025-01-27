use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use crowdfunding/types.{CampaignDatum, CampaignState, ConfigDatum}
use crowdfunding/utils

validator state_token_script(config_nft: PolicyId) {
  spend(
    datum: Option<Data>,
    redeemer: CampaignState,
    oref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(datum) = datum
    if datum is campaign_datum: CampaignDatum {
      let ConfigDatum { multisig, .. } =
        utils.ref_inputs_to_config_datum(tx.reference_inputs, config_nft)
      and {
        or {
          utils.atleast_signedby(tx.extra_signatories, multisig)?,
          ([campaign_datum.creator.1st] == tx.extra_signatories)?,
        },
        utils.must_send_state_token(
          tx,
          oref,
          with_datum: CampaignDatum { ..campaign_datum, state: redeemer },
        ),
      }
    } else if datum is config_datum: ConfigDatum {
      utils.atleast_signedby(tx.extra_signatories, config_datum.multisig)
    } else {
      fail @"Invalid Datum type recieved"
    }
  }

  else(_) {
    fail
  }
}
