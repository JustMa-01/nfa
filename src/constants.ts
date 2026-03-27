export const BRAND_NAME = "NO FIXED ADDRESS";
export const BRAND_TAGLINE = "CURATED TRAVEL EXPERIENCES";

export interface Destination {
  id: string;
  name: string;
  location: string;
  image: string;
  description: string;
  price: string;
  duration: string;
  category: string;
}

export const DESTINATIONS: Destination[] = [
  {
    id: "kyoto",
    name: "ANCIENT ECHOES",
    location: "KYOTO, JP",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200",
    description: "Immerse yourself in Japan's cultural heart. Wander through bamboo forests and historic temples.",
    price: "$3,200",
    duration: "10 DAYS",
    category: "CULTURAL"
  },
  {
    id: "amalfi",
    name: "COASTAL ESCAPE",
    location: "AMALFI, IT",
    image: "https://images.unsplash.com/photo-1533681436152-bd831412c142?auto=format&fit=crop&q=80&w=1200",
    description: "Experience the breathtaking beauty of the Italian coast. Cliffside villages and azure waters await.",
    price: "$4,500",
    duration: "7 DAYS",
    category: "RELAXATION"
  },
  {
    id: "patagonia",
    name: "WILD FRONTIER",
    location: "PATAGONIA, AR",
    image: "https://images.unsplash.com/photo-1544621481-9de4dfb1aecc?auto=format&fit=crop&q=80&w=1200",
    description: "Conquer the elements in South America's most rugged landscape. Glaciers, peaks, and pure isolation.",
    price: "$3,800",
    duration: "14 DAYS",
    category: "ADVENTURE"
  },
  {
    id: "santorini",
    name: "AEGEAN DREAM",
    location: "SANTORINI, GR",
    image: "https://images.unsplash.com/photo-1525595914565-df0e7b41120a?auto=format&fit=crop&q=80&w=1200",
    description: "Sun-drenched views and white-washed architecture. The ultimate romantic getaway on the Aegean sea.",
    price: "$2,900",
    duration: "5 DAYS",
    category: "ROMANTIC"
  }
];
