import {
  Address,
  Lovelace,
  OutRef,
  PaymentKeyHash,
  PolicyId,
  StakeKeyHash,
  Unit,
  UTxO,
  Validator,
} from "@lucid-evolution/lucid";
import { CampaignDatum, CampaignState } from "./cardano";

export type Support = { lovelace: Lovelace; ada: number };

export type BackerUTxO = {
  utxo: UTxO;
  pkh: PaymentKeyHash;
  skh?: StakeKeyHash;
  pk: Credential;
  sk?: Credential;
  address: Address;
  support: Support;
};

export type CampaignUTxO = {
  CampaignInfo: {
    id: PolicyId;
    platform: { pkh: PaymentKeyHash };
    nonce: OutRef;
    validator: Validator;
    address: Address;
    datum: CampaignDatum;
    data: {
      name: string;
      goal: number;
      deadline: Date;
      creator: { pk: Credential; sk?: Credential; address: Address };
      backers: BackerUTxO[];
      noDatum: UTxO[];
      support: Support;
      state: CampaignState;
    };
  };
  StateToken: {
    unit: Unit;
    utxo: UTxO;
  };
};
