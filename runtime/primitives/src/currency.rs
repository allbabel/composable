//! CurrencyId implementation
use codec::{CompactAs, Decode, Encode, MaxEncodedLen};
use composable_support::validation::Validate;
use composable_traits::{assets::Asset, currency::Exponent};
use core::{fmt::Display, ops::Div, str::FromStr};
use scale_info::TypeInfo;
use sp_runtime::{
	sp_std::{ops::Deref, vec::Vec},
	RuntimeDebug,
};

#[cfg(feature = "std")]
use serde::{Deserialize, Serialize};

/// Trait used to write generalized code over well know currencies
/// We use const to allow for match on these
/// Allows to have reuse of code amids runtime and cross relay transfers in future.
// TODO: split CurrencyId for runtimes - one for DOT and one for KSM
pub trait WellKnownCurrency {
	// works well with patterns unlike impl trait `associated consts cannot be referenced in
	// patterns`
	const NATIVE: Self;
	/// usually we expect running with relay,
	/// but if  not, than degenerative case would be this equal to `NATIVE`
	const RELAY_NATIVE: Self;
}

#[derive(
	Encode,
	Decode,
	MaxEncodedLen,
	Eq,
	PartialEq,
	Copy,
	Clone,
	RuntimeDebug,
	PartialOrd,
	Ord,
	TypeInfo,
	CompactAs,
	Hash,
)]
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[repr(transparent)]
pub struct CurrencyId(pub u128);

impl FromStr for CurrencyId {
	type Err = ();
	fn from_str(s: &str) -> Result<Self, Self::Err> {
		u128::from_str(s).map(CurrencyId).map_err(|_| ())
	}
}

impl Display for CurrencyId {
	fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
		let CurrencyId(id) = self;
		write!(f, "{}", id)
	}
}

impl WellKnownCurrency for CurrencyId {
	const NATIVE: CurrencyId = CurrencyId::PICA;
	const RELAY_NATIVE: CurrencyId = CurrencyId::KSM;
}

macro_rules! list_assets {
	(
		$(
			$(#[$attr:meta])*
			pub const $NAME:ident: CurrencyId = CurrencyId($id:literal);
		)*
	) => {
		$(
			$(#[$attr])*
			pub const $NAME: CurrencyId = CurrencyId($id);
		)*

		pub fn native_asset_name(id: u128) -> Result<&'static str, &'static str> {
			match id {
				$($id => Ok(stringify!($NAME)),)*
				_ => Err("Invalid native asset")
			}
		}

		pub fn to_native_id(name: &str) -> Result<CurrencyId, &'static str> {
			match name {
				$(stringify!($NAME) => Ok(CurrencyId::$NAME),)*
				_ => Err("Invalid native asset")
			}
		}

		pub fn list_assets() -> Vec<Asset> {
			[
				$(Asset { id: CurrencyId::$NAME.0 as u64, name: stringify!($NAME).as_bytes().to_vec() },)*
			]
			.to_vec()
		}
	}
}

impl CurrencyId {
	pub const INVALID: CurrencyId = CurrencyId(0);

	list_assets! {
		/// Runtime native token Kusama
		pub const PICA: CurrencyId = CurrencyId(1);
		/// Runtime native token Polkadot
		pub const LAYR: CurrencyId = CurrencyId(2);
		pub const CROWD_LOAN: CurrencyId = CurrencyId(3);

		/// Kusama native token
		pub const KSM: CurrencyId = CurrencyId(4);
		pub const PBLO: CurrencyId = CurrencyId(5);

		/// Karura stable coin(Karura Dollar), not native.
		#[allow(non_upper_case_globals)]
		pub const kUSD: CurrencyId = CurrencyId(129);
		pub const USDT: CurrencyId = CurrencyId(130);
		pub const USDC: CurrencyId = CurrencyId(131);
	}

	#[inline(always)]
	pub const fn decimals() -> Exponent {
		12
	}

	pub fn unit<T: From<u64>>() -> T {
		T::from(10_u64.pow(Self::decimals()))
	}

	pub fn milli<T: From<u64> + Div<Output = T>>() -> T {
		Self::unit::<T>() / T::from(1000_u64)
	}
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, TypeInfo)]
pub struct ValidateCurrencyId;

impl Validate<CurrencyId, ValidateCurrencyId> for ValidateCurrencyId {
	fn validate(input: CurrencyId) -> Result<CurrencyId, &'static str> {
		if input != CurrencyId::INVALID {
			Ok(input)
		} else {
			Err("Invalid Currency")
		}
	}
}

impl Validate<u64, ValidateCurrencyId> for ValidateCurrencyId {
	fn validate(input: u64) -> Result<u64, &'static str> {
		if input != 0_u64 {
			Ok(input)
		} else {
			Err("Invalid Currency")
		}
	}
}

impl Validate<u128, ValidateCurrencyId> for ValidateCurrencyId {
	fn validate(input: u128) -> Result<u128, &'static str> {
		if input != 0_u128 {
			Ok(input)
		} else {
			Err("Invalid Currency")
		}
	}
}

impl Default for CurrencyId {
	#[inline]
	fn default() -> Self {
		CurrencyId::INVALID
	}
}

impl Deref for CurrencyId {
	type Target = u128;

	#[inline]
	fn deref(&self) -> &Self::Target {
		&self.0
	}
}

impl From<CurrencyId> for u128 {
	#[inline]
	fn from(id: CurrencyId) -> Self {
		id.0
	}
}

impl From<u128> for CurrencyId {
	#[inline]
	fn from(raw: u128) -> Self {
		CurrencyId(raw)
	}
}

/// maps id to junction generic key,
/// unfortunately it is the best way to encode currency id as of now in XCM
#[cfg(feature = "develop")]
impl From<CurrencyId> for xcm::latest::Junction {
	fn from(this: CurrencyId) -> Self {
		xcm::latest::Junction::GeneralKey(this.encode())
	}
}

mod ops {
	use super::CurrencyId;
	use core::ops::{Add, Mul};
	use sp_runtime::traits::{Bounded, CheckedAdd, CheckedMul, One, Saturating, Zero};

	impl Add for CurrencyId {
		type Output = Self;

		fn add(self, rhs: Self) -> Self::Output {
			CurrencyId(self.0.add(rhs.0))
		}
	}

	impl Mul for CurrencyId {
		type Output = CurrencyId;

		fn mul(self, rhs: Self) -> Self::Output {
			CurrencyId(self.0.mul(rhs.0))
		}
	}

	impl CheckedAdd for CurrencyId {
		fn checked_add(&self, v: &Self) -> Option<Self> {
			Some(CurrencyId(self.0.checked_add(v.0)?))
		}
	}

	impl CheckedMul for CurrencyId {
		fn checked_mul(&self, v: &Self) -> Option<Self> {
			Some(CurrencyId(self.0.checked_mul(v.0)?))
		}
	}

	impl Zero for CurrencyId {
		fn zero() -> Self {
			CurrencyId(0)
		}

		fn is_zero(&self) -> bool {
			self.0.is_zero()
		}
	}

	impl One for CurrencyId {
		fn one() -> Self {
			CurrencyId(u128::one())
		}
	}

	impl Bounded for CurrencyId {
		fn min_value() -> Self {
			CurrencyId(u128::min_value())
		}

		fn max_value() -> Self {
			CurrencyId(u128::max_value())
		}
	}

	impl Saturating for CurrencyId {
		fn saturating_add(self, rhs: Self) -> Self {
			self.0.saturating_add(rhs.0).into()
		}

		fn saturating_sub(self, rhs: Self) -> Self {
			<u128 as Saturating>::saturating_sub(self.0, rhs.0).into()
		}

		fn saturating_mul(self, rhs: Self) -> Self {
			<u128 as Saturating>::saturating_mul(self.0, rhs.0).into()
		}

		fn saturating_pow(self, exp: usize) -> Self {
			<u128 as Saturating>::saturating_pow(self.0, exp).into()
		}
	}
}
