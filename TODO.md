1. Create Campaign
   ✅ Deadline should be present > Now(time)
   ✅ goal/amount/ask > 0
   ✅ Comsume Nonce/Oref
   ✅ REWARD token will be minted of predefined qty
   ✅ REWARD token UTxO with campaign datum to self_script
   ✅ STATE_TOKEN will be minted and sent to State_token_Script
   ✅ STATE_TOKEN will go to state_token_script

   OFFCHAIN - REWARD token will have same metadata as STATE_TOKEN
   OFFCHAIN - STATE_TOKEN metadata will contian Campaign description

2. Support Campaign
   ✅ suporter can support campaign only with predefined amount
   ✅ supporter should get fraction REWARD token

3. Cancel Campaign
   ✅ user can cancel campaign at any time
   ✅ platform can cancel after deadline
   ✅ funds should go back to each user/investor who funded the campaign (addr of user from utxo.datum)
   ✅ STATE_TOKEN state=Cancel

4. Finish Campaign
   ✅ Developer/User can finish campaign after deadline OR Goal reached
   ✅ funds should go to creator
   - or escrow
     ✅ STATE_TOKEN state=Finish
     ✅ must be signed by MultiSig

---

Milestone Based Payment released
✅ 5% fee for platform
✅ multisig at time of finish

TODO: remove use test_kit/time/unwrap
TODO: Take a look at utils.must_refund Function

PLATFORM = Multisig

CREATE

- dev = milestone/single , - if milestone ,take number of miletones, and the total amount should be divided by no. milestones

- multisig will verify the data from dev, - if accepted than supportes can supoort the campaign - if not dev need to apply again

SUPPORTS

- reward token will be send to the supports,
- only specfic amount can se supported

CANCEL

- dev or platform can cancel
- platform can cancel after deadline
- supports can't cancel
- after cancel, the supoorts money will go back to there wallet

- After project Finish the 5% will go to PLATFORM_single wallet

FINISH

- milestone

  - submission from dev , multisig will verify than the amount will be given to dev (amount/no.Milesontes)
  - charge 5% at each milestone.

- single
  - after multisig verify the amount-5% will go to dev addr

/// Fraction can't be fraction
/// Goal can't be fraction

<!--  Multisig Finish Campaign-->
<!-- Cancel Campaign -->

TEST CANCEL functionality with

- no reward token left in script
- some reward token left in scrtip
