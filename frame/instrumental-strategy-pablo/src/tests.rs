use composable_traits::instrumental::{
	AccessRights, Instrumental as InstrumentalTrait, InstrumentalProtocolStrategy,
	InstrumentalVaultConfig,
};
use frame_support::{assert_noop, assert_ok};
use primitives::currency::CurrencyId;
use sp_runtime::Perquintill;

use crate::mock::{
	account_id::ADMIN,
	helpers::create_layr_crowd_loan_pool,
	runtime::{
		Event, ExtBuilder, Instrumental, MockRuntime, Origin, PabloStrategy, System, VaultId,
		MAX_ASSOCIATED_VAULTS,
	},
};
#[allow(unused_imports)]
use crate::{pallet, pallet::Error};

// -------------------------------------------------------------------------------------------------
//                                          Associate Vault
// -------------------------------------------------------------------------------------------------

#[test]
fn add_an_associated_vault() {
	ExtBuilder::default().build().execute_with(|| {
		let vault_id: VaultId = 1;

		assert_ok!(PabloStrategy::associate_vault(&vault_id));
	});
}

#[test]
fn adding_an_associated_vault_twice_throws_an_error() {
	ExtBuilder::default().build().execute_with(|| {
		let vault_id: VaultId = 1;

		assert_ok!(PabloStrategy::associate_vault(&vault_id));
		assert_noop!(
			PabloStrategy::associate_vault(&vault_id),
			Error::<MockRuntime>::VaultAlreadyAssociated
		);
	});
}

#[test]
fn associating_too_many_vaults_throws_an_error() {
	ExtBuilder::default().build().execute_with(|| {
		for vault_id in 0..MAX_ASSOCIATED_VAULTS {
			assert_ok!(PabloStrategy::associate_vault(&(vault_id as VaultId)));
		}

		let vault_id = MAX_ASSOCIATED_VAULTS as VaultId;
		assert_noop!(
			PabloStrategy::associate_vault(&vault_id),
			Error::<MockRuntime>::TooManyAssociatedStrategies
		);
	});
}

// -------------------------------------------------------------------------------------------------
//                                             Rebalance
// -------------------------------------------------------------------------------------------------

#[test]
fn rebalance_emits_event() {
	ExtBuilder::default().build().execute_with(|| {
		System::set_block_number(1);

		let asset_id = CurrencyId::LAYR;
		// Create Vault (LAYR)
		let config = InstrumentalVaultConfig { asset_id, percent_deployable: Perquintill::zero() };
		let vault_id = <Instrumental as InstrumentalTrait>::create(config);
		assert_ok!(vault_id);
		let vault_id = vault_id.unwrap() as VaultId;

		// Create Pool (LAYR/CROWD_LOAN)
		let pool_id = create_layr_crowd_loan_pool();
		pallet::AdminAccountIds::<MockRuntime>::insert(ADMIN, AccessRights::Full);
		assert_ok!(PabloStrategy::set_pool_id_for_asset(Origin::signed(ADMIN), asset_id, pool_id));

		assert_ok!(PabloStrategy::associate_vault(&vault_id));

		assert_ok!(PabloStrategy::rebalance());

		System::assert_last_event(Event::PabloStrategy(pallet::Event::RebalancedVault {
			vault_id,
		}));
	});
}
