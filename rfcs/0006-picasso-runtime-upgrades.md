# Overview

Proposes flow to do runtime upgrades of Picasso. 

In its core [upgrades] are as described by Parity for developer network.

Extended with security measures, like Karura and Kusama have, to protect liqiudity on these networks.

Expected that the reader has understood official Parity documents and [explainers], [upgrades], [governance].

It is helpfull if reader undrestans *nix [substitute user] operation. 

Document is not intentended to described detailed specificaitons of quality gates.

Document specifies relevant domains and stakeholders and teams, but not names exactly what communication channel these would use as communicaiton medium.

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


| role | groups of people| area |  
|-----------------|-----| 
| release engineers | @ComposableFi/sre| | 
| integration stakeholders| @ComposableFi/blockchain-integrations | depend on runtime UI/Frontend/Bots/Explorer/Data integation |
| council |   ***concil***  | on chain list of keys with attahed ***identity*** | tokenomics, marketing |


### Collect release notes

If one wants to release changes to runtime, he shares merged pull requests or `done` project items linked to git commits with `release engineers`.

Only commits from main protected branch are accepted.

These can be @ComposableFi/developers or product owners, but can be anybody qualified.

Release engineers indicate good receipt of ask or request more information about proposed changes. 

### 

- All code is on main protected branch of this repo.
- Code is part `dali` runtime configuration.
- Code is part of `picasso` runtime configuration.
- Relevant(see other documents regarding acceptance criteria) preliminary checks, tests, and audits passed for added code.
- I send git commit hash to #sre to ask to deploy `wasm` including that hash.


Must run on Dali Rococo Testnet

### As SRE, we help to deploy changes to the runtime

- Given valid and credible git hash
- We ensure that runtime `wasm` with referenced code is available in `GitHub Releases`
- We collect all hashes to include in the next runtime upgrade.
- We ask for consensus from @ComposableFi/testers (QA) and @ComposableFi/technical-writers (docs are up to date with runtime) and @ComposableFi/security and @ComposableFi/blockchain-integrations (UI/Frontend/Explorer) are for upgrade including relevant hashes

### With SUDO (key, multi-signature, proxy)

@ComposableFi/sre follow Parity docs on runtime upgrade.

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

- <https://github.com/paritytech/substrate/blob/master/frame/system/src/lib.rs>
- <https://paritytech.github.io/substrate/master/sp_version/struct.RuntimeVersion.html>

[explainers]:https://www.youtube.com/playlist?list=PLOyWqupZ-WGuAuS00rK-pebTMAOxW41W8
[governance]:../doc/governance.md
[upgrades]: https://docs.substrate.io/tutorials/get-started/forkless-upgrade
[substitue user]:https://en.wikipedia.org/wiki/Sudo
