use cardano/address.{Address, Inline, VerificationKey}
use crowdfunding/types.{PaymentKeyHash, StakeKeyHash}
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{Input, Output, OutputReference, Transaction, InlineDatum}
use cardano/assets.{PolicyId}
use crowdfunding/types.{CampaignDatum, Initiated}
use aiken/collection/list
use aiken/collection/dict
use config
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