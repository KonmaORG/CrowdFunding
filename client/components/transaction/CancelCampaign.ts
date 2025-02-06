import {
  BackerDatum,
  CampaignActionRedeemer,
  CampaignDatum,
  CampaignStateRedeemer,
  MetadataType,
} from "@/types/cardano";
import { WalletConnection } from "@/context/walletContext";
import {
  Constr,
  Data,
  fromText,
  LucidEvolution,
  mintingPolicyToId,
  UTxO,
  validatorToAddress,
} from "@lucid-evolution/lucid";
import {
  CrowdfundingValidator,
  StateTokenValidator,
} from "@/config/scripts/scripts";
import { IdetificationPID, NETWORK } from "@/config";
import { FindRefUtxo, getAddress, submit, tupleToAddress } from "@/lib/utils";

export async function CancelCampaign(
  WalletConnection: WalletConnection,
  datum: CampaignDatum,
  metadata: MetadataType
) {
  const { address, lucid } = WalletConnection;
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
    const state_addr = getAddress(StateTokenValidator);
    // tokens
    const stateTokenKey = policyId + fromText("STATE_TOKEN");
    // utxos
    const campaignUtxos = await lucid.utxosAt(contarctAddress);
    const state_utxo = await lucid.utxosAtWithUnit(state_addr, stateTokenKey);
    const ref_utxo = await FindRefUtxo(lucid, state_addr);
    // Backer UTXOS
    const backerSupport = await backerUtxo(lucid, campaignUtxos);
    // Datum & Redeemer
    const updatedDatum: CampaignDatum = {
      ...datum,
      state: "Cancelled",
    };
    let newTx = lucid
      .newTx()
      .readFrom(ref_utxo)
      .collectFrom(campaignUtxos, CampaignActionRedeemer.Cancel)
      .collectFrom(state_utxo, CampaignStateRedeemer.Cancelled)
      .pay.ToContract(
        state_addr,
        { kind: "inline", value: Data.to(updatedDatum, CampaignDatum) },
        { lovelace: 2_000_000n, [stateTokenKey]: 1n }
      )
      .attach.SpendingValidator(Campaign_Validator)
      .attach.SpendingValidator(StateTokenValidator())
      .addSigner(address);

    for (const { datum, lovelace } of backerSupport) {
      newTx = newTx.pay.ToAddress(tupleToAddress(datum), {
        lovelace: lovelace,
      });
    }
    const tx = await newTx.complete({ localUPLCEval: false });

    submit(tx);
  } catch (error: any) {
    console.log("error", error);
    return error.message;
  }
}

// async function backerUtxo(lucid: LucidEvolution, utxos: UTxO[]) {
//   console.log(utxos);
//   for (const utxo of utxos) {
//     // Get and cast the datum
//     const data = await lucid.datumOf(utxo);
//     if (!data) continue;
//     try {
//       const backerDatum = Data.castFrom(data, BackerDatum);

//     } catch {
//       continue;
//     }
//   }

//   //   return result;
// }

async function backerUtxo(lucid: LucidEvolution, utxos: UTxO[]) {
  // Process UTxOs to extract BackerDatum with error handling
  const processedUtxosPromises = utxos.map(async (utxo) => {
    try {
      const rawDatum = await lucid.datumOf(utxo);
      const backerDatum = Data.castFrom(rawDatum, BackerDatum);
      return { utxo, backerDatum };
    } catch (error) {
      return null;
    }
  });

  // Wait for all promises to resolve
  const processedResults = await Promise.all(processedUtxosPromises);

  // Filter out null results and type assert
  const processedUtxos = processedResults.filter(
    (item): item is { utxo: UTxO; backerDatum: BackerDatum } => item !== null
  );

  // Group UTxOs by BackerDatum and sum lovelace
  const resultMap = new Map<string, { datum: BackerDatum; lovelace: bigint }>();

  for (const { utxo, backerDatum } of processedUtxos) {
    const lovelace = utxo.assets.lovelace || 0n; // Add fallback for undefined lovelace
    const key = Data.to(backerDatum);

    if (resultMap.has(key)) {
      const entry = resultMap.get(key)!;
      entry.lovelace += lovelace;
    } else {
      resultMap.set(key, { datum: backerDatum, lovelace });
    }
  }
  return Array.from(resultMap.values());
}
