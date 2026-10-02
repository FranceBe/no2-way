export interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
  corridor: string;
}

export const LOCATIONS: Location[] = [
  // Center & North
  { id: "westminster", name: "Westminster", lat: 51.497, lon: -0.137, corridor: "a4" },
  { id: "camden", name: "Camden", lat: 51.539, lon: -0.142, corridor: "a1" },
  { id: "hackney", name: "Hackney", lat: 51.545, lon: -0.055, corridor: "a10" },
  { id: "wembley", name: "Wembley", lat: 51.556, lon: -0.28, corridor: "a406" },
  // East
  { id: "stratford", name: "Stratford", lat: 51.542, lon: -0.003, corridor: "a12" },
  { id: "canary-wharf", name: "Canary Wharf", lat: 51.505, lon: -0.024, corridor: "a13" },
  { id: "greenwich", name: "Greenwich", lat: 51.482, lon: 0.0, corridor: "a2" },
  // South
  { id: "lewisham", name: "Lewisham", lat: 51.462, lon: -0.014, corridor: "a21" },
  { id: "brixton", name: "Brixton", lat: 51.461, lon: -0.116, corridor: "a23" },
  { id: "croydon", name: "Croydon", lat: 51.376, lon: -0.098, corridor: "a23" },
  { id: "wimbledon", name: "Wimbledon", lat: 51.421, lon: -0.206, corridor: "a3" },
  // West
  { id: "hammersmith", name: "Hammersmith", lat: 51.493, lon: -0.224, corridor: "a4" },
  { id: "ealing", name: "Ealing", lat: 51.513, lon: -0.305, corridor: "a40" },
  { id: "richmond", name: "Richmond", lat: 51.461, lon: -0.303, corridor: "a316" },
];

export const findLocation = (id: string | undefined): Location | undefined =>
  LOCATIONS.find((loc) => loc.id === id);