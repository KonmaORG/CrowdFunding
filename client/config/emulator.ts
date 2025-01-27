import { generateEmulatorAccount, Emulator } from '@lucid-evolution/lucid'

import { POLICYID } from '.'

export const accountA = generateEmulatorAccount({
  lovelace: 10_000_000_000n,
  [POLICYID + '00a5f7ce4ba8ea5eccca8ae3f622aad9cadc1570ab931f95e3f62f9e']: 100n,
})
export const accountB = generateEmulatorAccount({ lovelace: 10_000_000_000n })
export const accountC = generateEmulatorAccount({ lovelace: 10_000_000_000n })
export const accountD = generateEmulatorAccount({ lovelace: 10_000_000_000n })

export const emulator = new Emulator([accountA, accountB, accountC, accountD])
