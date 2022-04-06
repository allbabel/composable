#[allow(unused_imports)]

use crate::mock::runtime::{
    ALICE, Event, ExtBuilder, InstrumentalStrategy, Origin, System
};
use crate::pallet;

use frame_support::assert_ok;

#[test]
fn call_test_extrinsic() {
    ExtBuilder::default().build().execute_with(|| {
        assert_ok!(InstrumentalStrategy::test(Origin::signed(ALICE)));
    });
}

#[test]
fn test_extrinsic_emits_event() {
    ExtBuilder::default().build().execute_with(|| {
        System::set_block_number(1);

        assert_ok!(InstrumentalStrategy::test(Origin::signed(ALICE)));

        System::assert_last_event(Event::InstrumentalStrategy(
            pallet::Event::Test { issuer: ALICE}
        ));
    });
}
