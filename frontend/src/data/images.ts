/**
 * Central image configuration. Replace the `src` values with final production
 * assets (see comment above each key for the intended location/subject).
 */

export const images = {
  // Hero: modern farm with cattle, dashboard overlay context
  heroFarm:
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1600&auto=format&fit=crop",
  // Farmer checking cattle manually (problem statement section)
  farmerManualCheck:
    "/Images/meriksa-sapi.jpg",
  // Close-up smart ear tag on cattle
  earTagCloseup:
    "/Images/close-up-ear-tag.png",
  // Cattle in modern barn/enclosure
  modernBarn:
    "https://images.unsplash.com/photo-1465379944081-7f47de8d74ac?q=80&w=1400&auto=format&fit=crop",
  // Sensor / IoT technology closeup
  sensorTech:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop",
  // Data dashboard on laptop/tablet
  dataDashboard:
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1400&auto=format&fit=crop",
  // Agritech team collaborating
  agritechTeam:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1400&auto=format&fit=crop",
  // Wide landscape of livestock farm
  farmLandscape:
    "https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=1600&auto=format&fit=crop",
  // Veterinarian checking livestock
  vetChecking:
    "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=1400&auto=format&fit=crop",
  // Sustainable rural farming landscape
  sustainableFarming:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop",
  // Farmer using a smartphone in the field
  farmerSmartphone:
    "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?q=80&w=1400&auto=format&fit=crop",
  // Cattle herd grazing, cooperative-style farm
  cattleHerd:
    "https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=1400&auto=format&fit=crop",
  // About page hero – team/technology
  aboutHero:
    "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=1600&auto=format&fit=crop",
  // Smallholder farmer persona
  personaSmallholder:
    "/Images/peternak-indo.jpg",
  // Cooperative persona
  personaCooperative:
    "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1200&auto=format&fit=crop",
  // Commercial farm persona
  personaCommercial:
    "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1200&auto=format&fit=crop",
  // Government / veterinary institution persona
  personaGovernment:
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1200&auto=format&fit=crop",
  // Contact page - office / farm location
  contactLocation:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1400&auto=format&fit=crop",
  logoIcon: "/Images/logo.png",
};

export type ImageKey = keyof typeof images;
