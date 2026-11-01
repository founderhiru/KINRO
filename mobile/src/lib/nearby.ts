// Pure rule for the "Dogs near you" empty state on Home, kept free of React
// Native imports so it can be unit-tested directly.

/**
 * Fewer real dogs than this in the owner's city and Home says "be one of the
 * first" instead of showing a thin list. KINRO opens city by city, so an
 * honest empty state beats a nearly empty rail.
 */
export const MIN_NEARBY_DOGS = 3;

/** How many dogs count as "nearby": public profiles that aren't the owner's own. */
export function countNearbyDogs(
  dogs: readonly { id: string }[],
  ownDogIds: readonly string[],
): number {
  const own = new Set(ownDogIds);
  return dogs.filter((dog) => !own.has(dog.id)).length;
}

export function shouldShowFirstInCity(nearbyCount: number): boolean {
  return nearbyCount < MIN_NEARBY_DOGS;
}
