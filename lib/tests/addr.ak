
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Inline, Script, VerificationKey}
use crowdfunding/types.{
  PaymentKeyHash,
   StakeKeyHash,
}

pub fn script_address_from_tuple(key_hash_tuple: (PaymentKeyHash, StakeKeyHash)) {
  let (pkh, skh) = key_hash_tuple
  Address {
    payment_credential: pkh |> Script,
    stake_credential: if skh == "" {
      None
    } else {
      skh |> Script |> Inline |> Some
    },
  }
}


test addres_match(){
    let payment = #"8DCB6C8086719DE65966B8E6605BD6A190BFB09033A082B5808027D3"
    let key_haha = (payment,"")
    let addr = address_from_tuple(key_haha)
    trace @"addr" :addr
    True
}



test addres_match123(){
    let payment = #"09AC1C3797997A0AF2649EA1C11D95DBD679B405A16FC7522DF98CE7"
    let skh = #"5C186D4D7B5FBCC229369731B44574DDE8560FBC10AC16E817AFF69D"
    let key_haha = (payment,skh)
    let addr = address_from_tuple(key_haha)
    trace @"addr" :addr
    True
}


