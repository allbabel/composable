#!/bin/bash
#
# Runs benchmarks for runtimes whose files have changed.

#set -e # fail on any error

#shellcheck source=../common/lib.sh
. "$(dirname "${0}")/./common/lib.sh"

<<<<<<< HEAD
LATEST_TAG_NAME=$(get_latest_release ComposableFi/composable)
GITHUB_REF_NAME=$(git rev-parse --abbrev-ref HEAD)

=======
>>>>>>> 082c2a96d40ad5d977b1ee9a87fa748e49b70719
VERSIONS_FILES=(
  "runtime/picasso/src/weights,picasso-dev,picasso"
  "runtime/dali/src/weights,dali-dev,dali"
  "runtime/composable/src/weights,composable-dev,composable"
)

steps=50
repeat=20

pallets=(
	oracle
	frame_system
	timestamp
	session
	balances
	indices
	membership
	treasury
	scheduler
	collective
	democracy
	collator_selection
	utility
	lending
	dutch_auction
)

 boldprint "make sure the main branch and release tag are available in shallow clones"
 git fetch --depth="${GIT_DEPTH:-100}" origin main
 git fetch --depth="${GIT_DEPTH:-100}" origin "${LATEST_TAG_NAME}"
 git tag -f "${LATEST_TAG_NAME}" FETCH_HEAD
 git log -n1 "${LATEST_TAG_NAME}"


rustup install nightly
rustup target add wasm32-unknown-unknown --toolchain nightly
cargo build --release -p composable --features=runtime-benchmarks

run_benchmarks() {
  OUTPUT=$1
  CHAIN=$2
  # shellcheck disable=SC2068
  boldprint "Running benchmarks for $CHAIN"
  # shellcheck disable=SC2068
  for p in ${pallets[@]}; do
    ./target/release/composable benchmark \
      --chain="$CHAIN" \
      --execution=wasm \
      --wasm-execution=compiled \
      --pallet="$p" \
      --extrinsic='*' \
      --steps=$steps \
      --repeat=$repeat \
      --raw \
      --output="$OUTPUT"
  done
  USERNAME=$(gcloud secrets versions access latest --secret=github-api-username)
  PASSWORD=$(gcloud secrets versions access latest --secret=github-api-token)
  git remote set-url origin https://$USERNAME:$PASSWORD@github.com/ComposableFi/composable.git
  git add .
  git commit -m "Updates weights for $CHAIN"
  git push origin $GITHUB_REF_NAME
}

for i in "${VERSIONS_FILES[@]}"; do
  while IFS=',' read -r output chain folder; do
    if has_runtime_changes "${LATEST_TAG_NAME}" "${GITHUB_REF_NAME}" "$folder"; then
      run_benchmarks $output $chain
    fi
  done <<<"$i"
done
