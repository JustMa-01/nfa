import type { Package } from "../firebase/firestoreService";

export interface TransformationPath {
  packageId: string;
  reasoning: string;
  pulseLog: string;
  intensity: string;
}

export async function getTransformationPath(userVibe: string, packages: Package[]): Promise<TransformationPath> {
  // Simulate a brief network delay for realism
  await new Promise((resolve) => setTimeout(resolve, 900));

  if (!packages || packages.length === 0) {
    throw new Error("No destinations available");
  }

  const lower = userVibe.toLowerCase();
  
  // Try to find a loose match
  let selected = packages.find(p => 
    p.title.toLowerCase().includes(lower) || 
    p.description.toLowerCase().includes(lower) ||
    p.locations?.start.toLowerCase().includes(lower) ||
    p.locations?.end.toLowerCase().includes(lower) ||
    p.category.toLowerCase().includes(lower)
  );

  // Fallback to pseudos-random selection based on input length
  if (!selected) {
    selected = packages[userVibe.length % packages.length];
  }

  const startLoc = selected.locations?.start || 'Unknown Location';

  return {
    packageId: selected.id!,
    reasoning: `Your travel preferences align with the unique characteristics of ${startLoc}. This destination offers exactly what you're looking for.`,
    pulseLog: `Coordinates found: ${startLoc}. Ready for booking.`,
    intensity: "High Match"
  };
}
