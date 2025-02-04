import { IdetificationPID, NETWORK, SIGNER1, SIGNER2, SIGNER3 } from "@/config";
import {
  CrowdfundingValidator,
  StateTokenValidator,
} from "@/config/scripts/scripts";
import { WalletConnection } from "@/context/walletContext";
import { FindRefUtxo, getAddress, privateKeytoAddress } from "@/lib/utils";
import {
  CampaignDatum,
  CampaignStateRedeemer,
  MetadataType,
} from "@/types/cardano";
import {
  Constr,
  Data,
  fromText,
  mintingPolicyToId,
  UTxO,
  validatorToAddress,
} from "@lucid-evolution/lucid";

export async function ApproveCampaign(
  WalletConnection: WalletConnection,
  datum: CampaignDatum,
  metadata: MetadataType
) {
  const { lucid, address } = WalletConnection;
  try {
    if (!address || !lucid) throw Error("Wallet not Conencted");
    // oref
    const oref = new Constr(0, [
      String(metadata.hash),
      BigInt(metadata.outputIndex),
    ]);
    // validator parameter
    const Campaign_Validator = CrowdfundingValidator([
      datum.creator[0],
      oref,
      IdetificationPID,
    ]);
    // validator address & policyId
    const contarctAddress = validatorToAddress(NETWORK, Campaign_Validator);
    const policyId = mintingPolicyToId(Campaign_Validator);
    // refrence UTxO for ConfigDatum
    const state_addr = getAddress(StateTokenValidator);
    const ref_utxo = await FindRefUtxo(lucid, state_addr);
    // State TOken UTXO
    const stateToken = policyId + fromText("STATE_TOKEN");
    let UtxoWithStateToken: UTxO[] = await lucid.utxosAtWithUnit(
      state_addr,
      stateToken
    );

    //   Redeemer & datum
    const redeemer = CampaignStateRedeemer.Running;
    const updatedDatum: CampaignDatum = { ...datum, state: "Running" };
    const tx = await lucid
      .newTx()
      .readFrom(ref_utxo)
      .collectFrom(UtxoWithStateToken, redeemer)
      .pay.ToContract(
        contarctAddress,
        { kind: "inline", value: Data.to(updatedDatum, CampaignDatum) },
        {
          lovelace: 2n,
          [stateToken]: 1n,
        }
      )
      .attach.SpendingValidator(StateTokenValidator())
      .addSigner(await privateKeytoAddress(SIGNER1))
      .addSigner(await privateKeytoAddress(SIGNER2))
      .addSigner(await privateKeytoAddress(SIGNER3))
      .complete();

    console.log("tx complete");
  } catch (error: any) {
    console.log(error.message);
  }
}
