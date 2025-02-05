import { Constr, Data, TLiteral, WalletApi } from "@lucid-evolution/lucid";
import { Milestone as LucideMilestone } from "lucide-react";

/**
 * Wallet type definition
 */
export type Wallet = {
  name: string;
  icon: string;
  enable(): Promise<WalletApi>;
};

//#region Alias
export const PaymentKeyHashSchema = Data.Bytes();
export const StakeKeyHashSchema = Data.Bytes();

export const AddressSchema = Data.Tuple([
  PaymentKeyHashSchema,
  StakeKeyHashSchema,
]);
//#endregion

//#region Enum

export type CampaignState = "Initiated" | "Running" | "Cancelled" | "Finished";

export const CampaignState: Record<
  CampaignState,
  { Title: CampaignState; Schema: TLiteral<CampaignState>; Constr: Constr<[]> }
> = {
  Initiated: {
    Title: "Initiated",
    Schema: Data.Literal("Initiated"),
    Constr: new Constr(0, []),
  },
  Running: {
    Title: "Running",
    Schema: Data.Literal("Running"),
    Constr: new Constr(1, []),
  },
  Cancelled: {
    Title: "Cancelled",
    Schema: Data.Literal("Cancelled"),
    Constr: new Constr(2, []),
  },
  Finished: {
    Title: "Finished",
    Schema: Data.Literal("Finished"),
    Constr: new Constr(3, []),
  },
};

export const CampaignStateSchema = Data.Enum([
  CampaignState.Initiated.Schema,
  CampaignState.Running.Schema,
  CampaignState.Cancelled.Schema,
  CampaignState.Finished.Schema,
]);

export const CampaignStateRedeemer = {
  Initiated: Data.to(new Constr(0, [])),
  Running: Data.to(new Constr(1, [])),
  Cancelled: Data.to(new Constr(2, [])),
  Finished: Data.to(new Constr(3, [])),
  Released: Data.to(new Constr(4, [])),
};

// export type CampaignState = Data.Static<typeof CampaignStateSchema>;
// export const CampaignState = CampaignStateSchema as unknown as CampaignState;

//#endregion

//#region Datum

export const MilestoneArray = Data.Array(Data.Boolean());

export const CampaignDatumSchema = Data.Object({
  name: Data.Bytes(),
  goal: Data.Integer(),
  deadline: Data.Integer(),
  creator: AddressSchema,
  milestone: MilestoneArray,
  state: CampaignStateSchema,
  fraction: Data.Integer(),
});

export type CampaignDatum = Data.Static<typeof CampaignDatumSchema>;
export const CampaignDatum = CampaignDatumSchema as unknown as CampaignDatum;

export const BackerDatumSchema = AddressSchema;
export type BackerDatum = Data.Static<typeof BackerDatumSchema>;
export const BackerDatum = BackerDatumSchema as unknown as BackerDatum;

//-----------------------------
export const MultisigSchema = Data.Object({
  required: Data.Integer(),
  signers: Data.Array(Data.Bytes()),
});
export type Multisig = Data.Static<typeof MultisigSchema>;
export const Multisig = MultisigSchema as unknown as Multisig;
//-----------------------------------

export const ConfigDatumSchema = Data.Object({
  multisig: MultisigSchema,
  state_token_script: AddressSchema,
  platform: Data.Bytes(),
});

export type ConfigDatum = Data.Static<typeof ConfigDatumSchema>;
export const ConfigDatum = ConfigDatumSchema as unknown as ConfigDatum;
//#endregion

//#region Redeemer
export const CampaignActionRedeemer = {
  Support: Data.to(new Constr(0, [])),
  Cancel: Data.to(new Constr(1, [])),
  Finish: Data.to(new Constr(2, [])),
  Refund: Data.to(new Constr(3, [])),
  Release: Data.to(new Constr(4, [])),
};

export type MetadataType = {
  name: string;
  image: string;
  campaignName: string;
  description: string;
  hash: string;
  outputIndex: number;
};
