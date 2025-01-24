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
   suporter can support campaign only with predefined amount
   support should get fraction REWARD token

3. Cancel Campaign

   - user can cancel campaign at any time
   - platform can cancel after deadline
   - funds should go back to each user/investor who funded the campaign (addr of user from utxo.datum)
   - burn STATE_TOKEN

4. Finish Campaign
   - Developer/User can finish campaign after deadline OR Goal reached
   - funds should go to creator or escrow
   - burn STATE_TOKEN

Milestone Based Payment released
5% fee for platform
multisig at time of finish

TODO: remove use test_kit/time/unwrap
TODO: Take a look at utils.must_refund Function