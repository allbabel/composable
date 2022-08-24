# Overview

Proposes flow to do runtime upgrades of Picasso. 

In its core [upgrades]: https://docs.substrate.io/tutorials/get-started/forkless-upgrade are as described by Parity for the developer network.

Extended with security measures, like Karura and Kusama have, to protect liqiudity on these networks.

It is expected that the reader has understood: 
- [Official Parity documents](https://docs.substrate.io/)
- [explainers](https://www.youtube.com/playlist?list=PLOyWqupZ-WGuAuS00rK-pebTMAOxW41W8)
- [upgrades](https://docs.substrate.io/tutorials/get-started/forkless-upgrade)
- [governance](../doc/governance.md)

It is helpful if the reader understands *nix [substitute user](https://en.wikipedia.org/wiki/Sudo) operation. 

This document is not intentended to described detailed specificaitons of quality gates.

The Document specifies relevant domains and stakeholders and teams, but doesn't name exactly what communication channel these would use as communication medium.

## Constraints

- Upgrades can be done only under `Root` origin, but cannot be `single signature`. And yet we must be able to release very fast, for examples in case of hotfix.

- Upgrades are not immediate because runtime should be copied to parachain collators and relay validators and be enabled simultaneously on a specific block in the future.

- There should be aligment of stakeholders on quality of release to be sure that bridged Picasso assets are secure. 


## Legend

***represent on chain things*** which can be interacted via Polkadot.js or Composable parachain SDK.

## Flow

### Overview of flow

Relase notes collected, specifically `git commit`s which must be inlcuded into release are traceable to projects or pull request `item`s.

Relevant notes and references to runtime build artifact (`wasm`) is shared into company channel with relevant representativses.

Represantatives agree with this release.

Release is stored as ***preimage*** on Picasso. Preimage `hash` is shared in channel with ***counci*** representatives.

Council creates default YES ***motion*** to vote on enactment of premiage on democracy. Shareholdes and ***technicalCollective*** fast track enactment of new runtime.

Each step executed Here is mapping of teams to roles they play in process

#### Overview of actors

| role | groups of people| area |  
|-----------------|-----|-----|
| release engineers | `@ComposableFi/sre`| | 
| integration stakeholders| not direct contributers | depend on runtime UI/Frontend/Bots/Explorer/Data integation |
| council |   ***concil***(on chain list of keys with attahed ***identity***) | tokenomics, marketing |
| technical| ***technicalCollective*** | speed up on chain changes | 

#### Overview of core quality gates 

Minimal set of gates.

All changes to runtime are forward compatible.
Specifically, if extinsic was added, it is retained and new version are added with larger dispatch identifiers.
If storage was added, it is migrated by relevant runtime code on upgrade to new version. Storage is not ugprade in place as there consumers which may not be able to read it after it is changed. Same relates to events.

Runtime was upraded on Dali Rococo Testnet and was producing blocks here at for several hours.

Commit form which release is done passed full set of relevant check on protected main branch. 
You cannot force push. 
Each protocol on chain has ability to stop operating as of decision of its governance without dependency on runtime upgrade.

Resonable represenatives of stakeholders approved release to Piccaso.

All pallets included in Picasso runtime has sufficient amount of audit.

### Collect release notes

If one wants to release changes to runtime, he shares merged pull requests or `done` project items linked to git commits with `release engineers`.

Only commits from main protected branch are accepted.

These can be `@ComposableFi/developers` or product owners, but can be anybody qualified.

Release engineers indicate good receipt of ask or request more information about proposed changes. 

### Alignment kick off

Release engineers produce `wasm` from commit of protected branch which contains all relevant commits considered for inclusion in Picasso upgrade.

After some preliminary checks and aligment not specified here, Release engineers upgrade runtime on Dali Rococo Testnet using `sudo` key. 

Release engineers share relevant release notes, `wasm` refence and how to access runs of new runtime to stakeholder via relevant channel.

### Align

Here stakeholders do their quality gates and vote aggree with release. 
Amount of aggreent and exact teams to aggree depend on properties of upgrade. 
Examples, complexity of upgrade, need to hot fix.

On top of `core quality gates` next things can be considered:

`@ComposableFi/testers` runs full relevant set of integrations tests on Dali Rococo Testnet(Testnet for short).

`@ComposableFi/technical-writers` ensure that available documentation is not in conflcit with Picasso  upgrade.

`@ComposableFi/blockchain-integrations`, `@ComposableFi/bots` consider that user interface, historical data explorer and bot integrations will not negatively imact relevant integration and user experience.

`@ComposableFi/security` consider that runtime configuration(default values and included pallets) of Picasso is secure enough for relase. 

Amount and structure of alignemnt is not specified here, but some should be.


### On chain upgrade operations


#### Preparing preimage

After enough aligment happend, `Release engineers` upload runtime `wasm` on chain as ***preimage***.

Collected notes, preimage hash and alignment output is send to channel with council representatives. 

#### Council 




### As SRE, we help to deploy changes to the runtime

- Given valid and credible git hash
- We ensure that runtime `wasm` with referenced code is available in `GitHub Releases`
- We collect all hashes to include in the next runtime upgrade.
- We ask for consensus from  (QA) and  (docs are up to date with runtime) and @ComposableFi/security and (UI/Frontend/Explorer) are for upgrade including relevant hashes

### Without SUDO

- @ComposableFi/sre run CI job which uploads preimage to upgrade runtime on behalf of sudo
- Sent message to `council` members about the new upgrade.

### Council collective

- Coincil motion
- Creates default YES voting on democracy
- Votes yes with their funds

### Technical collective

- Fast tracks enactment

## References

- Acala Github release page shows of what is good consituent of release, diff of commits or main and dependant repos, hash codes, tool reports, wasm description, etc.
- <https://github.com/paritytech/substrate/blob/master/frame/system/src/lib.rs>
- <https://paritytech.github.io/substrate/master/sp_version/struct.RuntimeVersion.html>

[explainers]:https://www.youtube.com/playlist?list=PLOyWqupZ-WGuAuS00rK-pebTMAOxW41W8
[governance]:../doc/governance.md
[upgrades]: https://docs.substrate.io/tutorials/get-started/forkless-upgrade
[substitue user]:https://en.wikipedia.org/wiki/Sudo
