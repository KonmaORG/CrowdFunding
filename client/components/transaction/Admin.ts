import {
  IdetificationPID,
  NETWORK,
  PLATFORMADDR,
  SIGNER1,
  SIGNER2,
  SIGNER3,
} from "@/config";
import {
  IdentificationNFTValidator,
  StateTokenValidator,
} from "@/config/scripts/scripts";
import { WalletConnection } from "@/context/walletContext";
import { privateKeytoAddress, submit } from "@/lib/utils";
import { ConfigDatum, Multisig } from "@/types/cardano";
import {
  Constr,
  Data,
  fromText,
  mintingPolicyToId,
  validatorToAddress,
  paymentCredentialOf,
} from "@lucid-evolution/lucid";

export async function Identification_NFT_Mint(
  walletConnection: WalletConnection
) {
  const { lucid, address } = walletConnection;

  if (!address || !lucid) throw Error("Uninitialized Lucid!!!");
  let utxo = await lucid.utxosAt(address);
  const { txHash, outputIndex } = utxo[0];

  const oref = new Constr(0, [String(txHash), BigInt(outputIndex)]);

  const Identification_NFT_Mint_val = IdentificationNFTValidator([oref]);
  const minting_script = mintingPolicyToId(Identification_NFT_Mint_val);

  const asset = fromText("ConfigNFT");
  const token = { [`${minting_script}${asset}`]: 1n };
  const Redeemer = Data.to(0n);

  const tx = await lucid
    .newTx()
    .collectFrom([utxo[0]])
    .mintAssets(token, Redeemer)
    .attach.MintingPolicy(Identification_NFT_Mint_val)
    .complete();

  submit(tx);
  console.log("PID", minting_script);
}

export async function sendconfig(walletConnection: WalletConnection) {
  const { lucid, address } = walletConnection;

  if (!address || !lucid) throw Error("Uninitialized Lucid!!!");

  const state_token_addr = validatorToAddress(NETWORK, StateTokenValidator());

  const asset = fromText("ConfigNFT");
  const token = { [`${IdetificationPID}${asset}`]: 1n };

  const multisig: Multisig = {
    required: 2n,
    signers: [
      paymentCredentialOf(await privateKeytoAddress(SIGNER1)).hash,
      paymentCredentialOf(await privateKeytoAddress(SIGNER2)).hash,
      paymentCredentialOf(await privateKeytoAddress(SIGNER3)).hash,
    ],
  };
  const datum: ConfigDatum = {
    multisig,
    state_token_script: [paymentCredentialOf(state_token_addr).hash, ""],
    platform: paymentCredentialOf(PLATFORMADDR).hash,
  };
  const tx = await lucid
    .newTx()
    .pay.ToAddressWithData(
      state_token_addr,
      {
        kind: "inline",
        value: Data.to(datum, ConfigDatum),
      },
      { lovelace: 2_000_000n, ...token }
    )
    .complete();

  submit(tx);
}
