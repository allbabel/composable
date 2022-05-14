
//! Autogenerated weights for `scheduler`
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
<<<<<<< HEAD
//! DATE: 2022-05-02, STEPS: `50`, REPEAT: 20, LOW RANGE: `[]`, HIGH RANGE: `[]`
=======
//! DATE: 2022-05-06, STEPS: `50`, REPEAT: 20, LOW RANGE: `[]`, HIGH RANGE: `[]`
>>>>>>> ca605724 (Pushing benchmark changes)
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("composable-dev"), DB CACHE: 1024

// Executed Command:
// ./target/release/composable
// benchmark
// --chain=composable-dev
// --execution=wasm
// --wasm-execution=compiled
// --pallet=*
// --extrinsic=*
// --steps=50
// --repeat=20
// --output=runtime/composable/src/weights
// --log
// error

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::Weight};
use sp_std::marker::PhantomData;

/// Weight functions for `scheduler`.
pub struct WeightInfo<T>(PhantomData<T>);
impl<T: frame_system::Config> scheduler::WeightInfo for WeightInfo<T> {
	// Storage: Scheduler Agenda (r:2 w:2)
	// Storage: Preimage PreimageFor (r:1 w:1)
	// Storage: Preimage StatusFor (r:1 w:1)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn on_initialize_periodic_named_resolved(s: u32, ) -> Weight {
<<<<<<< HEAD
		(17_837_000 as Weight)
			// Standard Error: 37_000
			.saturating_add((47_315_000 as Weight).saturating_mul(s as Weight))
=======
		(13_644_000 as Weight)
			// Standard Error: 38_000
			.saturating_add((48_271_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((3 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((4 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	// Storage: Preimage PreimageFor (r:1 w:1)
	// Storage: Preimage StatusFor (r:1 w:1)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn on_initialize_named_resolved(s: u32, ) -> Weight {
<<<<<<< HEAD
		(12_779_000 as Weight)
			// Standard Error: 43_000
			.saturating_add((37_062_000 as Weight).saturating_mul(s as Weight))
=======
		(11_291_000 as Weight)
			// Standard Error: 34_000
			.saturating_add((37_820_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((2 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((3 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:2 w:2)
	// Storage: Preimage PreimageFor (r:1 w:1)
	// Storage: Preimage StatusFor (r:1 w:1)
	fn on_initialize_periodic_resolved(s: u32, ) -> Weight {
<<<<<<< HEAD
		(11_795_000 as Weight)
			// Standard Error: 32_000
			.saturating_add((40_481_000 as Weight).saturating_mul(s as Weight))
=======
		(10_834_000 as Weight)
			// Standard Error: 40_000
			.saturating_add((41_595_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((3 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((3 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	// Storage: Preimage PreimageFor (r:1 w:1)
	// Storage: Preimage StatusFor (r:1 w:1)
	fn on_initialize_resolved(s: u32, ) -> Weight {
<<<<<<< HEAD
		(9_800_000 as Weight)
			// Standard Error: 33_000
			.saturating_add((33_800_000 as Weight).saturating_mul(s as Weight))
=======
		(11_359_000 as Weight)
			// Standard Error: 35_000
			.saturating_add((34_928_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((2 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((2 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:2 w:2)
	// Storage: Preimage PreimageFor (r:1 w:0)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn on_initialize_named_aborted(s: u32, ) -> Weight {
<<<<<<< HEAD
		(13_057_000 as Weight)
			// Standard Error: 16_000
			.saturating_add((15_614_000 as Weight).saturating_mul(s as Weight))
=======
		(15_958_000 as Weight)
			// Standard Error: 17_000
			.saturating_add((16_087_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
			.saturating_add(T::DbWeight::get().writes((1 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:2 w:2)
	// Storage: Preimage PreimageFor (r:1 w:0)
	fn on_initialize_aborted(s: u32, ) -> Weight {
<<<<<<< HEAD
		(13_899_000 as Weight)
			// Standard Error: 14_000
			.saturating_add((9_050_000 as Weight).saturating_mul(s as Weight))
=======
		(12_932_000 as Weight)
			// Standard Error: 14_000
			.saturating_add((9_922_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: Scheduler Agenda (r:2 w:2)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn on_initialize_periodic_named(s: u32, ) -> Weight {
<<<<<<< HEAD
		(23_042_000 as Weight)
			// Standard Error: 30_000
			.saturating_add((24_204_000 as Weight).saturating_mul(s as Weight))
=======
		(21_785_000 as Weight)
			// Standard Error: 23_000
			.saturating_add((25_060_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((2 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:2 w:2)
	fn on_initialize_periodic(s: u32, ) -> Weight {
<<<<<<< HEAD
		(20_750_000 as Weight)
			// Standard Error: 20_000
			.saturating_add((17_578_000 as Weight).saturating_mul(s as Weight))
=======
		(21_003_000 as Weight)
			// Standard Error: 24_000
			.saturating_add((18_639_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().reads((1 as Weight).saturating_mul(s as Weight)))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((1 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn on_initialize_named(s: u32, ) -> Weight {
<<<<<<< HEAD
		(21_715_000 as Weight)
			// Standard Error: 19_000
			.saturating_add((13_904_000 as Weight).saturating_mul(s as Weight))
=======
		(20_601_000 as Weight)
			// Standard Error: 19_000
			.saturating_add((14_952_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
			.saturating_add(T::DbWeight::get().writes((1 as Weight).saturating_mul(s as Weight)))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	fn on_initialize(s: u32, ) -> Weight {
<<<<<<< HEAD
		(20_245_000 as Weight)
			// Standard Error: 15_000
			.saturating_add((11_251_000 as Weight).saturating_mul(s as Weight))
=======
		(20_654_000 as Weight)
			// Standard Error: 13_000
			.saturating_add((12_275_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	fn schedule(s: u32, ) -> Weight {
<<<<<<< HEAD
		(30_917_000 as Weight)
			// Standard Error: 2_000
			.saturating_add((158_000 as Weight).saturating_mul(s as Weight))
=======
		(30_758_000 as Weight)
			// Standard Error: 2_000
			.saturating_add((169_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(1 as Weight))
	}
	// Storage: Scheduler Agenda (r:1 w:1)
	// Storage: Scheduler Lookup (r:0 w:1)
	fn cancel(s: u32, ) -> Weight {
<<<<<<< HEAD
		(30_379_000 as Weight)
			// Standard Error: 5_000
			.saturating_add((1_977_000 as Weight).saturating_mul(s as Weight))
=======
		(30_695_000 as Weight)
			// Standard Error: 8_000
			.saturating_add((2_357_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(1 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: Scheduler Lookup (r:1 w:1)
	// Storage: Scheduler Agenda (r:1 w:1)
	fn schedule_named(s: u32, ) -> Weight {
<<<<<<< HEAD
		(39_069_000 as Weight)
			// Standard Error: 5_000
			.saturating_add((175_000 as Weight).saturating_mul(s as Weight))
=======
		(38_259_000 as Weight)
			// Standard Error: 3_000
			.saturating_add((184_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
	// Storage: Scheduler Lookup (r:1 w:1)
	// Storage: Scheduler Agenda (r:1 w:1)
	fn cancel_named(s: u32, ) -> Weight {
<<<<<<< HEAD
		(34_467_000 as Weight)
			// Standard Error: 6_000
			.saturating_add((1_981_000 as Weight).saturating_mul(s as Weight))
=======
		(34_055_000 as Weight)
			// Standard Error: 6_000
			.saturating_add((2_358_000 as Weight).saturating_mul(s as Weight))
>>>>>>> ca605724 (Pushing benchmark changes)
			.saturating_add(T::DbWeight::get().reads(2 as Weight))
			.saturating_add(T::DbWeight::get().writes(2 as Weight))
	}
}
