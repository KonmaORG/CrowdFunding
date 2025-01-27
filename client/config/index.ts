import {
  Blockfrost,
  Network,
  Provider,
  validatorToAddress,
} from '@lucid-evolution/lucid'

import { KarbonStoreValidator } from './scripts/scripts'
export const BF_URL = process.env.NEXT_PUBLIC_BF_URL!
export const BF_PID = process.env.NEXT_PUBLIC_BF_PID!
const NETWORKx = process.env.NEXT_PUBLIC_CARDANO_NETWORK as Network

export const ROYALTY = 3
export const ROYALTYADDR =
  'addr_test1qpcggzpxkmeq959e5xk79d6mtm9f6vnwd2w8z97qwx45wpy52dt4zw07q2cx8ly3l4vrwrtudyj55kwagwcj77z04ydswdysjy'
export const NETWORK: Network = NETWORKx
export const PROVIDER: Provider = new Blockfrost(BF_URL, BF_PID)
// export const provider: Provider = new Koios("/koios");

export const KARBONSTOREADDR = validatorToAddress(NETWORK, KarbonStoreValidator)
export const POLICYID =
  // "a38a6084e71db8dc7c7a2f63707cd083b5e0e67aebc38cb7bada208c";
  '75f7fed150c1020caa4a1badb9370dc6e07d0724d9ab36d4fb5c65e2'
