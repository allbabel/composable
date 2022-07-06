use composable_support::validation::Validate;
use composable_traits::{defi::Sell, xcm::XcmSellRequest};
use frame_support::pallet_prelude::*;
use scale_info::TypeInfo;

#[derive(Clone, Copy, RuntimeDebug, PartialEq, TypeInfo, Default)]
pub struct XcmSellRequestValid;

impl Validate<XcmSellRequest, XcmSellRequestValid> for XcmSellRequestValid {
	fn validate(request: XcmSellRequest) -> Result<XcmSellRequest, &'static str> {
		let base = request.order.pair.base;
		let quote = request.order.pair.quote;
		ensure!(base != quote, "Auction creation with the same asset.");
		Ok(request)
	}
}

#[derive(Clone, Copy, RuntimeDebug, PartialEq, TypeInfo, Default)]
pub struct SellValid;

impl<AssetId: PartialEq, Balance> Validate<Sell<AssetId, Balance>, SellValid> for SellValid {
	fn validate(sell: Sell<AssetId, Balance>) -> Result<Sell<AssetId, Balance>, &'static str> {
		ensure!(sell.pair.base != sell.pair.quote, "Sell with the same asset.");
		Ok(sell)
	}
}
