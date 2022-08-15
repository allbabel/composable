export default {
  rpc: {},
  types: {
    ComposableTraitsStakingRewardPool: {
      owner: "AccountId32",
      assetId: "u128",
      rewards: "BTreeMap<u128, ComposableTraitsStakingRewardConfig>"
    },
    ComposableTraitsStakingRewardUpdate: "Null",
    ComposableTraitsStakingRewardConfig: "Null",
    ComposableTraitsStakingLockLockConfig: {
      durationPresets: "BTreeMap<u64, Perbill>",
      unlockPenalty: "Perbill"
    },
    ComposableTraitsStakingRewardPoolConfiguration: {
      RewardRateBasedIncentive: {
        owner: "AccountId32",
        assetId: "u128",
        endBlock: "u32",
        rewardConfigs: "BTreeMap<u128, ComposableTraitsStakingRewardConfig>",
        lock: "ComposableTraitsStakingLockLockConfig"
      }
    },
    ComposableTraitsStakingStake: {
      owner: "AccountId",
      rewardPoolId: "u16",
      stake: "Balance",
      share: "Balance",
      reductions: "BoundedBTreeMap<AssetId, Balance, Limit>",
      lock: "ComposableTraitsStakingLockLockConfig"
    },
  }
};
