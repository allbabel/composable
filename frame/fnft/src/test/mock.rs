#![cfg(test)]

use composable_tests_helpers::test::block::{process_and_progress_blocks, MILLISECS_PER_BLOCK};
use composable_traits::{account_proxy::ProxyType, fnft::FnftAccountProxyType};
use frame_support::{
	parameter_types,
	traits::{ConstU32, ConstU64, Everything, InstanceFilter},
	PalletId,
};
use frame_system as system;
use sp_core::H256;
use sp_runtime::{
	testing::Header,
	traits::{BlakeTwo256, IdentityLookup},
};

type UncheckedExtrinsic = frame_system::mocking::MockUncheckedExtrinsic<MockRuntime>;
type Block = frame_system::mocking::MockBlock<MockRuntime>;

// Configure a mock runtime to test the pallet.
frame_support::construct_runtime!(
	pub enum MockRuntime where
		Block = Block,
		NodeBlock = Block,
		UncheckedExtrinsic = UncheckedExtrinsic,
	{
		System: frame_system::{Pallet, Call, Config, Storage, Event<T>},
		Timestamp: pallet_timestamp::{Pallet, Call, Storage},
		Nft: crate::{Pallet, Storage , Event<T>},
		Proxy: pallet_account_proxy::{Pallet, Call, Storage , Event<T>},
	}
);

parameter_types! {
	pub const FnftPalletId: PalletId = PalletId(*b"pal_fnft");
}
impl crate::Config for MockRuntime {
	type Event = Event;

	type MaxProperties = ConstU32<16>;
	type FinancialNftCollectionId = u16;
	type FinancialNftInstanceId = u64;
	type ProxyType = ProxyType;
	type AccountProxy = Proxy;
	type ProxyTypeSelector = FnftAccountProxyType;
	type PalletId = FnftPalletId;
}

impl pallet_timestamp::Config for MockRuntime {
	type Moment = u64;
	type OnTimestampSet = ();
	type MinimumPeriod = ConstU64<{ MILLISECS_PER_BLOCK / 2 }>;
	type WeightInfo = ();
}

parameter_types! {
	pub MaxProxies : u32 = 4;
	pub MaxPending : u32 = 32;
	// just make dali simple to proxy
	pub ProxyPrice: u32 = 0;
}

impl pallet_account_proxy::Config for MockRuntime {
	type Event = Event;
	type Call = Call;
	type Currency = ();
	type ProxyType = ProxyType;
	type ProxyDepositBase = ProxyPrice;
	type ProxyDepositFactor = ProxyPrice;
	type MaxProxies = MaxProxies;
	type WeightInfo = ();
	type MaxPending = MaxPending;
	type CallHasher = BlakeTwo256;
	type AnnouncementDepositBase = ProxyPrice;
	type AnnouncementDepositFactor = ProxyPrice;
}

parameter_types! {
	pub const BlockHashCount: u64 = 250;
	pub const SS58Prefix: u8 = 42;
}

impl system::Config for MockRuntime {
	type BaseCallFilter = Everything;
	type BlockWeights = ();
	type BlockLength = ();
	type DbWeight = ();
	type Origin = Origin;
	type Call = Call;
	type Index = u64;
	type BlockNumber = u64;
	type Hash = H256;
	type Hashing = BlakeTwo256;
	type AccountId = u128;
	type Lookup = IdentityLookup<Self::AccountId>;
	type Header = Header;
	type Event = Event;
	type BlockHashCount = BlockHashCount;
	type Version = ();
	type PalletInfo = PalletInfo;
	type AccountData = ();
	type OnNewAccount = ();
	type OnKilledAccount = ();
	type SystemWeightInfo = ();
	type SS58Prefix = SS58Prefix;
	type OnSetCode = ();
	type MaxConsumers = ConstU32<16>;
}

impl InstanceFilter<Call> for ProxyType {
	fn filter(&self, c: &Call) -> bool {
		match self {
			ProxyType::Any => true,
			ProxyType::Governance => matches!(
				c,
				// TODO democracy
				Call::System(..)
			),
			_ => false,
		}
	}
	fn is_superset(&self, o: &Self) -> bool {
		match (self, o) {
			(x, y) if x == y => true,
			(ProxyType::Any, _) => true,
			(_, ProxyType::Any) => false,
			_ => false,
		}
	}
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
	let t = frame_system::GenesisConfig::default().build_storage::<MockRuntime>().unwrap();
	let mut ext = sp_io::TestExternalities::new(t);
	// start at block 1 else events don't work
	ext.execute_with(|| process_and_progress_blocks::<Nft, MockRuntime>(1));
	ext
}
