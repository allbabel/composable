// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { BTreeMap, Null, Struct, u128, u16, u32, u64 } from "@polkadot/types-codec";
import type { AccountId, AccountId32, AssetId, Balance, Perbill } from "@polkadot/types/interfaces/runtime";

/** @name ComposableTraitsStakingLockLockConfig */
export interface ComposableTraitsStakingLockLockConfig extends Struct {
  readonly durationPresets: BTreeMap<u64, Perbill>;
  readonly unlockPenalty: Perbill;
}

/** @name ComposableTraitsStakingRewardConfig */
export interface ComposableTraitsStakingRewardConfig extends Null {}

/** @name ComposableTraitsStakingRewardPool */
export interface ComposableTraitsStakingRewardPool extends Struct {
  readonly owner: AccountId32;
  readonly assetId: u128;
  readonly rewards: BTreeMap<u128, ComposableTraitsStakingRewardConfig>;
}

/** @name ComposableTraitsStakingRewardPoolConfiguration */
export interface ComposableTraitsStakingRewardPoolConfiguration extends Struct {
  readonly RewardRateBasedIncentive: {
    readonly owner: AccountId32;
    readonly assetId: u128;
    readonly endBlock: u32;
    readonly rewardConfigs: BTreeMap<u128, ComposableTraitsStakingRewardConfig>;
    readonly lock: ComposableTraitsStakingLockLockConfig;
  } & Struct;
}

/** @name ComposableTraitsStakingRewardUpdate */
export interface ComposableTraitsStakingRewardUpdate extends Null {}

/** @name ComposableTraitsStakingStake */
export interface ComposableTraitsStakingStake extends Struct {
  readonly owner: AccountId;
  readonly rewardPoolId: u16;
  readonly stake: Balance;
  readonly share: Balance;
  readonly reductions: BTreeMap<AssetId, Balance>;
  readonly lock: ComposableTraitsStakingLockLockConfig;
}

export type PHANTOM_STAKINGREWARDS = 'stakingRewards';
