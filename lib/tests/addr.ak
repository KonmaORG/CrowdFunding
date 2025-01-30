// use aiken/crypto.{VerificationKeyHash}
// use cardano/address.{Address, Inline, Script, VerificationKey}
// use crowdfunding/types.{PaymentKeyHash, StakeKeyHash}
// use utils

// pub fn script_address_from_tuple(key_hash_tuple: (PaymentKeyHash, StakeKeyHash)) {
//   let (pkh, skh) = key_hash_tuple
//   Address {
//     payment_credential: pkh |> Script,
//     stake_credential: if skh == "" {
//       None
//     } else {
//       skh |> Script |> Inline |> Some
//     },
//   }
// }

// test addres_match() {
//   let payment = #"8dcb6c8086719de65966b8e6605bd6a190bfb09033a082b5808027d3"
//   let key_haha = (payment, "")
//   let addr = utils.address_from_tuple(key_haha)
//   trace @"addr": addr
//   True
// }

// test addres_match123() {
//   let payment = #"09ac1c3797997a0af2649ea1c11d95dbd679b405a16fc7522df98ce7"
//   let skh = #"5c186d4d7b5fbcc229369731b44574dde8560fbc10ac16e817aff69d"
//   let key_haha = (payment, skh)
//   let addr = address_from_tuple(key_haha)
//   trace @"addr": addr
//   True
// }
