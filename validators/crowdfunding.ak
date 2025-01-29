use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{Input, Output, OutputReference, Transaction}
use crowdfunding/types.{
  BackerDatum, CampaignAction, CampaignDatum, Cancel, ConfigDatum, Finish,
  Refund, Release, Support,
}
use crowdfunding/utils
use functions.{
  validate_cancel_campaign, validate_create_campaign, validate_finish_campaign,
  validate_refund_support, validate_release_campaign, validate_support_campaign,
}

validator campaign(
  creator: VerificationKeyHash,
  nonce: OutputReference,
  config_nft: PolicyId,
) {
  mint(
    redeemer campaign_datum: CampaignDatum,
    policy_id self_script: PolicyId,
    tx: Transaction,
  ) {
    let ConfigDatum { state_token_script, .. } =
      utils.ref_inputs_to_config_datum(tx.reference_inputs, config_nft)
    validate_create_campaign(
      tx,
      self_script,
      campaign_datum,
      nonce,
      creator,
      utils.script_address_from_tuple(state_token_script),
    )
  }

  spend(
    datum: Option<Data>,
    redeemer: CampaignAction,
    o_ref: OutputReference,
    tx: Transaction,
  ) {
    expect Some(Input { output: Output { address, .. }, .. }) =
      transaction.find_input(tx.inputs, o_ref)
    expect Script(self_script) = address.payment_credential
    let ConfigDatum { multisig, platform, state_token_script } =
      utils.ref_inputs_to_config_datum(tx.reference_inputs, config_nft)
    when (datum, redeemer) is {
      // Support campaign:
      (Some(current_datum), Support) ->
        if current_datum is campaign_datum: CampaignDatum {
          validate_support_campaign(tx.outputs, campaign_datum, self_script)
        } else {
          fail @"Invalid Cancel Datum Type! Must be CampaignDatum"
        }
      // Cancel campaign:
      (Some(current_datum), Cancel) ->
        if current_datum is campaign_datum: CampaignDatum {
          validate_cancel_campaign(
            tx,
            self_script,
            campaign_datum,
            multisig,
            utils.address_from_tuple(state_token_script),
          )
        } else if current_datum is backer_datum: BackerDatum {
          tx |> validate_refund_support(self_script, backer_datum)
        } else {
          fail @"Invalid Cancel Datum Type! Must be CampaignDatum"
        }

      // Finish campaign:
      (Some(current_datum), Finish) ->
        validate_finish_campaign(
          tx,
          self_script,
          current_datum,
          utils.address_from_tuple(state_token_script),
          multisig,
        )
      // Refund campaign:
      (Some(current_datum), Refund) ->
        if current_datum is backer_datum: BackerDatum {
          tx |> validate_refund_support(self_script, backer_datum)
        } else {
          fail @"Invalid Refund Datum Type! Must be BackerDatum"
        }
      // Release Payment
      (Some(current_datum), Release) ->
        if current_datum is campaign_datum: CampaignDatum {
          validate_release_campaign(
            tx,
            self_script,
            campaign_datum,
            platform,
            utils.address_from_tuple(state_token_script),
            multisig,
          )
        } else {
          fail @"Invalid Refund Datum Type! Must be BackerDatum"
        }
      // NoDatum etc:
      _ -> {
        expect !utils.is_running_campaign(tx.reference_inputs, self_script)
        utils.atleast_signedby(tx.extra_signatories, multisig)
      }
    }
  }

  else(_) {
    fail
  }
}
