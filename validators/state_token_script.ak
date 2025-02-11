use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use crowdfunding/types.{CampaignDatum, CampaignState, ConfigDatum, Released}
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
      let updated_datum = utils.updating_datum_milestone(campaign_datum)
      trace @"updated_Datum": updated_datum
      trace @"redeemer": redeemer
      and {
        or {
          utils.atleast_signedby(tx.extra_signatories, multisig)?,
          ([campaign_datum.creator.1st] == tx.extra_signatories)?,
        },
        when redeemer is {
          Released -> utils.must_send_state_token(tx, oref, updated_datum)?
          _ ->
            utils.must_send_state_token(
              tx,
              oref,
              with_datum: CampaignDatum { ..campaign_datum, state: redeemer },
            )?
        },
      }
    } else if datum is config_datum: ConfigDatum {
      trace @"config_datum cond^"
      utils.atleast_signedby(tx.extra_signatories, config_datum.multisig)?
    } else {
      fail @"Invalid Datum type recieved"
    }
  }

  else(_) {
    fail
  }
}
