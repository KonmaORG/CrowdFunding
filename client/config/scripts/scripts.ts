import { applyDoubleCborEncoding, applyParamsToScript, Validator } from '@lucid-evolution/lucid'

import { state_token_script_state_token_script_spend, crowdfunding_campaign_spend, crowdfunding_campaign_mint, identication_nft_identification_nft_mint } from './plutus'

//------------------------------------------------------------------
const identificationNFT_Mint = applyDoubleCborEncoding(
    identication_nft_identification_nft_mint,
  );
  
  export function IdentificationNFTValidator(params: any[]): Validator {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(identificationNFT_Mint, params),
    };
  }

// ------------------------------------------------------------------
const state_token_script = applyDoubleCborEncoding(
    state_token_script_state_token_script_spend,
  );
  
  export function StateTokenValidator(params: any[]): Validator {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(state_token_script, params),
    };
  }


//   ------------------------------------------------------------------
const crowdfunding_script = applyDoubleCborEncoding(
    crowdfunding_campaign_spend
)

export function CrowdfundingValidator(params: any[]): Validator {
    return {
      type: "PlutusV3",
      script: applyParamsToScript(crowdfunding_script, params),
    };
}
