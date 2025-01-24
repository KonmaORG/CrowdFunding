use cardano/assets.{PolicyId}
use cardano/transaction.{OutputReference, Transaction}
use modules/functions.{must_burn_token,
  must_consume_utxo, must_mint_exactly_one}

// TODO:  separate spend and mint handler
validator identification_nft(o_ref: OutputReference) {
  mint(redeemer: Int, policy_id: PolicyId, tx: Transaction) {
    let Transaction { inputs, mint, .. } = tx
    when redeemer is {
      // 0 = minting
      0 -> and {
          must_consume_utxo(inputs, o_ref)?,
          must_mint_exactly_one(mint, policy_id)?,
        }
      // 1 = burning
      1 -> True
    }
  }

  else(_) {
    fail
  }
}

fn must_consume_utxo(inputs: List<Input>, o_ref: OutputReference) {
  expect Some(_input) = find_input(inputs, o_ref)
  True
}

fn must_mint_exactly_one(mint: Value, policy_id: PolicyId) -> Bool {
  expect [Pair(_, qty)] =
    mint
      |> assets.tokens(policy_id)
      |> dict.to_pairs()
  (qty == 1)?
}
