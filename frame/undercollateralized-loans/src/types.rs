use crate::{strategies::repayment_strategies::RepaymentStrategy, Config};
use composable_traits::{
	defi::DeFiComposableConfig,
	undercollateralized_loans::{LoanConfig, LoanInput, MarketConfig, MarketInfo, MarketInput},
};
use frame_support::pallet_prelude::*;
use sp_core::TypeId;
use sp_runtime::Percent;

pub(crate) type TimeMeasure = i64;

pub(crate) type MarketInputOf<T> = MarketInput<
	<T as frame_system::Config>::AccountId,
	<T as DeFiComposableConfig>::MayBeAssetId,
	<T as frame_system::Config>::BlockNumber,
	<T as Config>::LiquidationStrategyId,
>;

pub(crate) type LoanInputOf<T> = LoanInput<
	<T as frame_system::Config>::AccountId,
	<T as DeFiComposableConfig>::Balance,
	Percent,
	RepaymentStrategy,
>;

pub(crate) type MarketInfoOf<T> = MarketInfo<
	<T as frame_system::Config>::AccountId,
	<T as DeFiComposableConfig>::MayBeAssetId,
	<T as frame_system::Config>::BlockNumber,
	<T as Config>::LiquidationStrategyId,
	<T as Config>::VaultId,
>;

pub(crate) type MarketConfigOf<T> = MarketConfig<
	<T as frame_system::Config>::AccountId,
	<T as DeFiComposableConfig>::MayBeAssetId,
	<T as frame_system::Config>::BlockNumber,
	<T as Config>::VaultId,
>;

pub(crate) type LoanConfigOf<T> = LoanConfig<
	<T as frame_system::Config>::AccountId,
	<T as DeFiComposableConfig>::Balance,
	Percent,
	RepaymentStrategy,
	TimeMeasure,
>;

#[derive(Encode, Decode)]
pub struct LoanId(pub [u8; 8]);

impl TypeId for LoanId {
	const TYPE_ID: [u8; 4] = *b"loan";
}
