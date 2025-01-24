1. Create Campaign
   DONE - goal/amount/ask > 0
   DONE - user will apply for Campaign , will mint STATE_TOKEN
   DONE - REWARD token will be minted too of predefined qty
   DONE - REWARD token will be stored in self script
   DONE - STATE_TOKEN will go to predefined simple script_address
   DONE - Deadline should be present > Now(time) - REWARD token UTxO with campaign datum
   OFFCHAIN - REWARD token will have same metadata as STATE_TOKEN
   OFFCHAIN - STATE_TOKEN metadata will contian Campaign description

2. Support Campaign
   DONE - suporter can support campaign only with predefined amount
   DONE - support should get fraction REWARD token

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
