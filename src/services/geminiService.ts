export interface TransformationPath {
  destinationId: string;
  reasoning: string;
  pulseLog: string;
  adrenalineFrequency: string;
}

const MOCK_RESPONSES: TransformationPath[] = [
  {
    destinationId: "tokyo",
    reasoning: "Your craving for neon-soaked urban overload maps perfectly to Tokyo's hyper-sensory grid.",
    pulseLog: "Operative, you are being deployed to the neon catacombs of Shinjuku. The city breathes at 200bpm — keep up or get left behind. Synchronize your neural feed with the grid and prepare for total immersion.",
    adrenalineFrequency: "9.1 GHz",
  },
  {
    destinationId: "berlin",
    reasoning: "Your vibe resonates with Berlin's underground pulse — raw, unfiltered, and brutally honest.",
    pulseLog: "You are being vectored into the concrete jungle where techno is religion and the night never ends. Berlin doesn't sleep — it evolves. Lock onto Berghain's frequency and ride the sonic wave until dawn.",
    adrenalineFrequency: "SONIC SURGE",
  },
  {
    destinationId: "mexico-city",
    reasoning: "The chaos and color of Mexico City aligns with your high-voltage energy signature.",
    pulseLog: "Mission coordinates locked: CDMX, where ancient ruins meet street-level hedonism. This city operates on pure adrenaline — every corner is a new frequency, every market a live transmission. Consume or be consumed.",
    adrenalineFrequency: "MAX VOLTAGE",
  },
  {
    destinationId: "nyc",
    reasoning: "New York's relentless forward momentum matches your unstoppable trajectory.",
    pulseLog: "You are being deployed to the grid that never dims. NYC runs on caffeine, ambition, and sheer audacity. Every borough is a different frequency — tune in, drop out of your comfort zone, and let the city reprogram you.",
    adrenalineFrequency: "8.4 GHz",
  },
];

function pickDestination(vibe: string): TransformationPath {
  const lower = vibe.toLowerCase();

  if (/tokyo|japan|anime|neon|cyber|tech|futur/i.test(lower)) return MOCK_RESPONSES[0];
  if (/berlin|german|techno|underground|rave|electr/i.test(lower)) return MOCK_RESPONSES[1];
  if (/mexico|latin|color|vibrant|warm|sun|spic/i.test(lower)) return MOCK_RESPONSES[2];
  if (/new york|nyc|city|urban|hustle|ambit|wall/i.test(lower)) return MOCK_RESPONSES[3];

  // Default: rotate based on text length
  return MOCK_RESPONSES[vibe.length % MOCK_RESPONSES.length];
}

export async function getTransformationPath(userVibe: string): Promise<TransformationPath> {
  // Simulate a brief network delay for realism
  await new Promise((resolve) => setTimeout(resolve, 900));
  return pickDestination(userVibe);
}
