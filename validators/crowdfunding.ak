use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId}
use cardano/transaction.{Input, Output, OutputReference, Transaction}
use crowdfunding/types.{
  BackerDatum, CampaignAction, CampaignDatum, Cancel, Finish, Refund, Support,
}
use crowdfunding/utils
use functions.{
  validate_cancel_campaign, validate_create_campaign, validate_finish_campaign,
  validate_refund_support, validate_support_campaign,
}

validator campaign(
  platform: VerificationKeyHash,
  creator: VerificationKeyHash,
  nonce: OutputReference,
  state_token_script: Address,
) {
  mint(
    redeemer campaign_datum: CampaignDatum,
    policy_id self_script: PolicyId,
    tx: Transaction,
  ) {
    validate_create_campaign(
      tx,
      self_script,
      campaign_datum,
      nonce,
      creator,
      state_token_script,
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
            platform,
            state_token_script,
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
          platform,
          state_token_script,
        )
      // Refund campaign:
      (Some(current_datum), Refund) ->
        if current_datum is backer_datum: BackerDatum {
          tx |> validate_refund_support(self_script, backer_datum)
        } else {
          fail @"Invalid Refund Datum Type! Must be BackerDatum"
        }
      // NoDatum etc:
      _ -> {
        expect !utils.is_running_campaign(tx.reference_inputs, self_script)
        tx |> utils.must_be_signed_by(platform)
      }
    }
  }

  else(_) {
    fail
  }
}
