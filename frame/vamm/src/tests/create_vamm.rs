use std::ops::RangeInclusive;

use crate::{
	mock::{Event, ExtBuilder, MockRuntime, System, TestPallet},
	pallet::{self, Error, VammMap, VammState},
	tests::{
		any_sane_asset_amount, any_sane_base_quote_peg, loop_times, min_max_reserve,
		valid_twap_period, zero_reserve, Balance, Decimal, Timestamp, RUN_CASES,
	},
};
use composable_traits::vamm::{AssetType, Vamm as VammTrait, VammConfig, MINIMUM_TWAP_PERIOD};
use frame_support::{assert_noop, assert_ok};
use proptest::prelude::*;
use sp_runtime::FixedPointNumber;

// ----------------------------------------------------------------------------------------------------
//                                        Prop Compose & Helpers
// ----------------------------------------------------------------------------------------------------

fn one_up_to_(x: Balance) -> RangeInclusive<Balance> {
	1..=x
}

prop_compose! {
	fn limited_quote_peg() (
		x in 1..=(Balance::MAX/Decimal::DIV),
	) (
		y in one_up_to_(x),
		x in Just(x),
		first_is_quote in any::<bool>()
	) -> (Balance, Balance) {
		if first_is_quote {
			(x, y)
		} else {
			(y, x)
		}
	}
}

prop_compose! {
	fn any_valid_vammconfig() (
		(quote_asset_reserves, peg_multiplier) in limited_quote_peg(),
		base_asset_reserves in any_sane_asset_amount(),
		twap_period in  valid_twap_period()
	) -> VammConfig<Balance, Timestamp> {
		VammConfig {
			base_asset_reserves,
			quote_asset_reserves,
			peg_multiplier,
			twap_period
		}
	}
}

// -------------------------------------------------------------------------------------------------
//                                            Unit Tests
// -------------------------------------------------------------------------------------------------

#[test]
fn create_vamm_fail_if_twap_period_is_less_than_minimum() {
	let vamm_state = VammConfig::<Balance, Timestamp> {
		twap_period: (MINIMUM_TWAP_PERIOD - 1).into(),
		peg_multiplier: 1,
		..Default::default()
	};
	ExtBuilder::default().build().execute_with(|| {
		assert_noop!(TestPallet::create(&vamm_state), Error::<MockRuntime>::FundingPeriodTooSmall);
	})
}

// -------------------------------------------------------------------------------------------------
//                                             Proptests
// -------------------------------------------------------------------------------------------------

proptest! {
	#![proptest_config(ProptestConfig::with_cases(RUN_CASES))]
	#[test]
	fn create_vamm_correctly_returns_vamm_state(
		vamm_config in any_valid_vammconfig(),
	) {
		ExtBuilder::default().build().execute_with(|| {
			let vamm_counter = TestPallet::vamm_count();

			let invariant = TestPallet::compute_invariant(
				vamm_config.base_asset_reserves,
				vamm_config.quote_asset_reserves
			).unwrap();

			let tmp_vamm_expected = VammState::<Balance, Timestamp, Decimal> {
					base_asset_reserves: vamm_config.base_asset_reserves,
					quote_asset_reserves: vamm_config.quote_asset_reserves,
					peg_multiplier: vamm_config.peg_multiplier,
					invariant,
					..Default::default()
			};

			let base_asset_twap = TestPallet::do_get_price(&tmp_vamm_expected, AssetType::Base).unwrap();
			let quote_asset_twap = TestPallet::do_get_price(&tmp_vamm_expected, AssetType::Quote).unwrap();

			let vamm_expected = VammState::<Balance, Timestamp, Decimal> {
				base_asset_reserves: vamm_config.base_asset_reserves,
				quote_asset_reserves: vamm_config.quote_asset_reserves,
				peg_multiplier: vamm_config.peg_multiplier,
				twap_period: vamm_config.twap_period,
				base_asset_twap: base_asset_twap,
				quote_asset_twap: quote_asset_twap,
				invariant,
				..Default::default()
			};

			let vamm_created_ok = TestPallet::create(&vamm_config);
			let vamm_created_some = TestPallet::get_vamm(vamm_created_ok.unwrap());

			assert_ok!(vamm_created_ok);
			assert_eq!(vamm_created_some, Some(vamm_expected));

			assert_eq!(TestPallet::vamm_count(), vamm_counter+1);
		});
	}

	#[test]
	fn create_vamm_succeeds(
		vamm_config in any_valid_vammconfig(),
	) {
		ExtBuilder::default().build().execute_with(|| {
			assert_ok!(TestPallet::create(&vamm_config));
		});
	}

	#[test]
	fn create_vamm_zero_base_asset_reserves_error(
		mut vamm_config in any_valid_vammconfig(),
	) {
		ExtBuilder::default().build().execute_with(|| {
			vamm_config.base_asset_reserves = 0;
			assert_noop!(
				TestPallet::create(&vamm_config),
				Error::<MockRuntime>::BaseAssetReserveIsZero);
		})
	}

	#[test]
	fn create_vamm_zero_quote_asset_reserves_error(
		mut vamm_config in any_valid_vammconfig(),
	) {
		ExtBuilder::default().build().execute_with(|| {
			vamm_config.quote_asset_reserves = 0;
			assert_noop!(
				TestPallet::create(&vamm_config),
				Error::<MockRuntime>::QuoteAssetReserveIsZero);
		})
	}

	#[test]
	fn create_vamm_zero_peg_multiplier_error(
		mut vamm_config in any_valid_vammconfig(),
	) {
		ExtBuilder::default().build().execute_with(|| {
			vamm_config.peg_multiplier = 0;
			assert_noop!(
				TestPallet::create(&vamm_config),
				Error::<MockRuntime>::PegMultiplierIsZero);
		})
	}

	#[test]
	fn create_vamm_update_counter_succeeds(
		vamm_config in any_valid_vammconfig(),
		loop_times in loop_times(),
	) {
		ExtBuilder::default().build().execute_with(|| {
			let markets = TestPallet::vamm_count();

			for _ in 0..loop_times {
				assert_ok!(TestPallet::create(&vamm_config));
			}

			assert_eq!(TestPallet::vamm_count(), markets + loop_times);
		});
	}

	#[test]
	fn create_vamm_emits_event_succeeds(
		vamm_config in any_valid_vammconfig(),
	) {
		ExtBuilder::default().build().execute_with(|| {
			System::set_block_number(1);
			assert_ok!(TestPallet::create(&vamm_config));
			let vamm_created = TestPallet::get_vamm(0).unwrap();
			System::assert_last_event(Event::TestPallet(
				pallet::Event::Created { vamm_id: 0_u128, state: vamm_created}
			))
		});
	}

	#[test]
	fn create_vamm_updates_storage_map(
		vamm_config in any_valid_vammconfig(),
	) {
		ExtBuilder::default().build().execute_with(|| {
			assert!(!VammMap::<MockRuntime>::contains_key(0_u128));
			assert_ok!(TestPallet::create(&vamm_config));
			assert!(VammMap::<MockRuntime>::contains_key(0_u128));
		});
	}
}
