export type SatelliteType = "Imaging" | "Communication" | "Weather" | "Radar";

export interface Satellite {
  id: string;
  name: string;
  type: SatelliteType;
  orbit: string;
  spec: string;
  pricePerHour: number;
  availability: string;
  availabilityStatus: "now" | "soon" | "later";
}

export const satellites: Satellite[] = [
  {
    id: "aqua-7",
    name: "Aqua-7 LEO Imager",
    type: "Imaging",
    orbit: "LEO (500km)",
    spec: "0.5m/pixel resolution",
    pricePerHour: 450,
    availability: "Available Now",
    availabilityStatus: "now",
  },
  {
    id: "commstar-geo",
    name: "CommStar Geostationary",
    type: "Communication",
    orbit: "GEO (35,786km)",
    spec: "10 Gbps bandwidth",
    pricePerHour: 800,
    availability: "Available Now",
    availabilityStatus: "now",
  },
  {
    id: "meteoscan-pro",
    name: "MeteoScan Pro",
    type: "Weather",
    orbit: "SSO (800km)",
    spec: "Multispectral sensors",
    pricePerHour: 250,
    availability: "In 45 mins",
    availabilityStatus: "soon",
  },
  {
    id: "terra-sar-x",
    name: "Terra SAR-X",
    type: "Radar",
    orbit: "LEO (514km)",
    spec: "1m SAR resolution",
    pricePerHour: 600,
    availability: "Tomorrow",
    availabilityStatus: "later",
  },
  {
    id: "skyeye-2",
    name: "SkyEye-2",
    type: "Imaging",
    orbit: "LEO (450km)",
    spec: "1m/pixel resolution",
    pricePerHour: 320,
    availability: "In 2 hours",
    availabilityStatus: "soon",
  },
  {
    id: "polar-link",
    name: "PolarLink L-band",
    type: "Communication",
    orbit: "Polar (780km)",
    spec: "Global IoT coverage",
    pricePerHour: 150,
    availability: "Available Now",
    availabilityStatus: "now",
  },
];
