use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Inline, Script, VerificationKey}
use cardano/assets.{Lovelace, PolicyId}
use cardano/transaction.{
  InlineDatum, Input, Output, OutputReference, Transaction,
}
use config
use crowdfunding/types.{
  BackerDatum, CampaignDatum, Initiated, PaymentKeyHash, Running, StakeKeyHash,
}
use test_kit/time/unwrap

pub fn address_from_tuple(key_hash_tuple: (PaymentKeyHash, StakeKeyHash)) {
  let (pkh, skh) = key_hash_tuple
  Address {
    payment_credential: pkh |> VerificationKey,
    stake_credential: if skh == "" {
      None
    } else {
      skh |> VerificationKey |> Inline |> Some
    },
  }
}

pub fn must_consume_creator_nonce(
  tx: Transaction,
  creator: VerificationKeyHash,
  nonce: OutputReference,
) -> Bool {
  let Input(
    output_reference,
    Output { address: Address { payment_credential, .. }, .. },
  ) <- list.any(tx.inputs)

  // the nonce utxo must come from the campaign creator
  and {
    output_reference == nonce,
    VerificationKey(creator) == payment_credential,
  }
}

pub fn must_mint_state_and_reward_token(
  tx: Transaction,
  self_script: PolicyId,
  datum: CampaignDatum,
) -> Bool {
  let CampaignDatum { name, fraction, .. } = datum
  let minted_tokens = tx.mint |> assets.tokens(self_script) |> dict.to_pairs()

  // restrict minting to 1 quantity and 1 asset name with self Policy ID
  [Pair(config.state_token, 1), Pair(name, fraction)] == minted_tokens
}

pub fn must_send_state_reward_token(
  tx: Transaction,
  self_script: PolicyId,
  state_token_address: Address,
  with_datum: CampaignDatum,
) -> Bool {
  let with_datum_data: Data = with_datum
  let self_address = address.from_script(self_script)
  let counter = {
    let Output { address, datum, value, .. } <- list.count(tx.outputs)

    when datum is {
      // STATE token to state_token addr or self_script if state is not running
      InlineDatum(output_datum) -> and {
          if with_datum.state == Initiated {
            address == state_token_address
          } else {
            address == self_address
          },
          output_datum == with_datum_data,
          assets.quantity_of(value, self_script, config.state_token) == 1,
        }

      // REWARD token to self script addr
      _ -> and {
          address == self_address,
          assets.quantity_of(value, self_script, with_datum.name) == with_datum.fraction,
        }
    }
  }
  counter == 2
}

pub fn is_running_campaign(
  tx_inputs: List<Input>,
  self_script: PolicyId,
) -> Bool {
  // must consume/refer state token UTxO
  expect Some(Input { output: Output { datum, .. }, .. }) = {
    let input <- list.find(tx_inputs)
    assets.quantity_of(input.output.value, self_script, config.state_token) == 1
  }

  // must be campaign inline datum
  expect InlineDatum(campaign_datum) = datum
  expect CampaignDatum { state, .. } = campaign_datum

  state == Running
}

pub fn must_be_signed_by(tx: Transaction, signer: VerificationKeyHash) -> Bool {
  // just expect 1 signer
  ([signer] == tx.extra_signatories)?
}

pub fn must_be_after_deadline(tx: Transaction, deadline: Int) -> Bool {
  // tx validFrom is after or at deadline
  (unwrap.finite_start_of(tx.validity_range) >= deadline)?
}

pub fn must_refund(
  tx: Transaction,
  self_script: PolicyId,
  backer_datum: BackerDatum,
) {
  let backer_datum_data: Data = backer_datum

  // collect input backer support lovelaces from self address
  let self_address = Address(Script(self_script), None)
  let sum_input =
    fn(sum, Input { output: Output { address, datum, value, .. }, .. }) {
      if address == self_address {
        when datum is {
          InlineDatum(input_datum) ->
            if input_datum == backer_datum_data {
              assets.lovelace_of(value) + sum
            } else {
              sum
            }
          _ -> sum
        }
      } else {
        sum
      }
    }
  let input_lovelace = list.reduce(tx.inputs, 0, sum_input)

  // collect output lovelaces to backer address
  let backer_address = address_from_tuple(backer_datum)
  let sum_output =
    fn(sum, Output { address, value, .. }) {
      if address == backer_address {
        assets.lovelace_of(value) + sum
      } else {
        sum
      }
    }
  let output_lovelace = list.reduce(tx.outputs, 0, sum_output)

  (output_lovelace >= input_lovelace)?
}

pub fn must_reach_goal_and_send_to_creator(
  tx: Transaction,
  self_script: PolicyId,
  goal: Lovelace,
  (creator_pkh, creator_skh),
  platform: VerificationKeyHash,
) {
  let self_address = Address(Script(self_script), None)

  // helper fn to sum backer supports from TxInputs
  let sum_support =
    fn(sum, Input { output: Output { address, datum, value, .. }, .. }) {
      if address == self_address {
        when datum is {
          InlineDatum(input_datum) ->
            if input_datum is BackerDatum {
              assets.lovelace_of(value) + sum
            } else {
              sum
            }
          _ -> sum
        }
      } else {
        sum
      }
    }
  // backer supports must reach goal (sum_support >= goal)?
  let supports = tx.inputs |> list.reduce(0, sum_support)
  expect supports >= goal
  let (platform_pay, creator_pay) = calculate_payout_platform_creator(supports)
  let creator_address = (creator_pkh, creator_skh) |> address_from_tuple

  // helper fn to sum TxOutputs Lovelace sent to creator
  let sum_creator =
    fn(sum, Output { address, value, .. }) {
      if address == creator_address {
        assets.lovelace_of(value) + sum
      } else {
        sum
      }
    }

  let sum_platform =
    fn(sum, Output { address, value, .. }) {
      when address.payment_credential is {
        VerificationKey(vkh) ->
          if vkh == platform {
            assets.lovelace_of(value) + sum
          } else {
            sum
          }
        _ -> sum
      }
    }
  // creator must receive backer supports (sum_creator >= sum_support)?
  and {
    list.reduce(tx.outputs, 0, sum_creator) >= creator_pay,
    list.reduce(tx.outputs, 0, sum_platform) >= platform_pay,
  }
}

pub fn find_output_from_PID(
  outputs: List<Output>,
  policy_id: PolicyId,
  name: ByteArray,
) {
  expect [supporter_output,
    script_output] =
    list.filter(
      outputs,
      fn(output) {
        let has_reward_token = output.value |> assets.tokens(policy_id)
        !dict.is_empty(has_reward_token)
      },
    )
  let reward_token_to_backer =
    assets.quantity_of(supporter_output.value, policy_id, name)
  let script_token = assets.quantity_of(script_output.value, policy_id, name)

  (reward_token_to_backer, script_token)
}

pub fn find_output_from_addr(
  outputs: List<Output>,
  self_script: PolicyId,
  name: ByteArray,
) {
  let address = Address(Script(self_script), None)
  expect [script_output,
    backers_amount_output] =
    list.filter(outputs, fn(output) { output.address == address })
  let script_token = assets.quantity_of(script_output.value, self_script, name)
  (assets.lovelace_of(backers_amount_output.value), script_token)
}

pub fn calculate_payout_platform_creator(amount: Int) -> (Int, Int) {
  let platform = amount * 5 / 100
  let seller = amount - platform
  (platform, seller)
}
