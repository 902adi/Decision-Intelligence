export interface Ward {
  id: string;
  number: number;
  name: string;
  nameHi: string;
  nameMr: string;
  elevation: number; // in meters above sea level
  population: number;
  vulnerablePopulation: number;
  drainCapacity: number; // percentage (0-100)
  distanceToRiver: number; // in meters
  centroid: { x: number; y: number };
  svgPolygon: string; // SVG path or polygon points
}

export interface RoadEdge {
  id: string;
  name: string;
  fromWard: string;
  toWard: string;
  lengthKm: number;
  floodThresholdMm: number; // water rise at which this road submerges
  pathPoints: Array<[number, number]>;
}

export interface ResourceItem {
  id: string;
  name: string;
  type: 'pump' | 'boat' | 'rescue_team' | 'ambulance';
  capacityRate: string; // e.g. "5000 L/min" or "10 persons"
  assignedWardId: string;
  baseDepotId: string;
  status: 'available' | 'deployed' | 'in_transit' | 'maintenance';
}

export interface Depot {
  id: string;
  name: string;
  wardId: string;
  coordinates: { x: number; y: number };
}

export interface ReliefCamp {
  id: string;
  code: string;
  name: string;
  nameHi: string;
  nameMr: string;
  wardId: string;
  coordinates: { x: number; y: number };
  totalCapacity: number;
  currentOccupancy: number;
  foodPackets: number;
  drinkingWaterLiters: number;
  medicalKits: number;
  hourlyFoodBurnRate: number; // per person per hour
  hourlyWaterBurnRate: number; // liters per person per hour
}

export const riverPath = "M 80,0 C 130,120 180,240 260,330 C 340,420 400,510 460,600";
export const drainChannels = [
  "M 260,330 L 430,280 L 590,320",
  "M 140,150 L 320,110 L 510,70",
  "M 370,440 L 550,470 L 720,490"
];

export const rivergateWards: Ward[] = [
  {
    id: 'ward-1',
    number: 1,
    name: 'Riverside Promenade',
    nameHi: 'रिवरसाइड प्रोमेनेड',
    nameMr: 'रिव्हरसाइड प्रोमेनेड',
    elevation: 4.2,
    population: 14200,
    vulnerablePopulation: 2100,
    drainCapacity: 35,
    distanceToRiver: 60,
    centroid: { x: 170, y: 160 },
    svgPolygon: "70,70 190,80 230,220 120,240 60,160",
  },
  {
    id: 'ward-2',
    number: 2,
    name: 'Old Fort Bazaar',
    nameHi: 'पुराना किला बाज़ार',
    nameMr: 'जुना किल्ला बाजार',
    elevation: 6.8,
    population: 22500,
    vulnerablePopulation: 4800,
    drainCapacity: 28,
    distanceToRiver: 140,
    centroid: { x: 260, y: 180 },
    svgPolygon: "190,80 340,90 350,220 230,220",
  },
  {
    id: 'ward-3',
    number: 3,
    name: 'Fishermen Wharf',
    nameHi: 'मछुआरों की बस्ती (घाट)',
    nameMr: 'कोळीवाडा बंदर',
    elevation: 3.1,
    population: 9800,
    vulnerablePopulation: 2400,
    drainCapacity: 20,
    distanceToRiver: 20,
    centroid: { x: 190, y: 310 },
    svgPolygon: "120,240 230,220 280,340 180,380 90,320",
  },
  {
    id: 'ward-4',
    number: 4,
    name: 'Mill Gate Industrial',
    nameHi: 'मिल गेट औद्योगिक क्षेत्र',
    nameMr: 'मिल गेट औद्योगिक वसाहत',
    elevation: 5.4,
    population: 16400,
    vulnerablePopulation: 2900,
    drainCapacity: 42,
    distanceToRiver: 180,
    centroid: { x: 310, y: 310 },
    svgPolygon: "230,220 350,220 380,350 280,340",
  },
  {
    id: 'ward-5',
    number: 5,
    name: 'Greenfield Heights',
    nameHi: 'ग्रीनफील्ड हाइट्स',
    nameMr: 'ग्रीनफिल्ड हाइट्स',
    elevation: 18.5,
    population: 28000,
    vulnerablePopulation: 3100,
    drainCapacity: 85,
    distanceToRiver: 1100,
    centroid: { x: 670, y: 180 },
    svgPolygon: "570,70 760,80 770,250 590,240",
  },
  {
    id: 'ward-6',
    number: 6,
    name: 'Civil Lines North',
    nameHi: 'सिविल लाइन्स उत्तर',
    nameMr: 'सिव्हिल लाइन्स उत्तर',
    elevation: 12.0,
    population: 19200,
    vulnerablePopulation: 2200,
    drainCapacity: 65,
    distanceToRiver: 650,
    centroid: { x: 470, y: 140 },
    svgPolygon: "340,90 570,70 590,240 460,230 350,220",
  },
  {
    id: 'ward-7',
    number: 7,
    name: 'Station Colony',
    nameHi: 'स्टेशन कॉलोनी',
    nameMr: 'स्टेशन कॉलनी',
    elevation: 7.5,
    population: 24000,
    vulnerablePopulation: 3900,
    drainCapacity: 38,
    distanceToRiver: 340,
    centroid: { x: 450, y: 310 },
    svgPolygon: "350,220 460,230 520,360 380,350",
  },
  {
    id: 'ward-8',
    number: 8,
    name: 'Highridge University',
    nameHi: 'हाईरिज विश्वविद्यालय परिसर',
    nameMr: 'हायरीज विद्यापीठ परिसर',
    elevation: 24.0,
    population: 15000,
    vulnerablePopulation: 1100,
    drainCapacity: 90,
    distanceToRiver: 1400,
    centroid: { x: 680, y: 340 },
    svgPolygon: "590,240 770,250 780,410 580,410",
  },
  {
    id: 'ward-9',
    number: 9,
    name: 'South Canal Bridge',
    nameHi: 'दक्षिण नहर पुल क्षेत्र',
    nameMr: 'दक्षिण कालवा पूल परिसर',
    elevation: 4.9,
    population: 17600,
    vulnerablePopulation: 3300,
    drainCapacity: 30,
    distanceToRiver: 110,
    centroid: { x: 260, y: 460 },
    svgPolygon: "180,380 280,340 370,440 280,560 160,500",
  },
  {
    id: 'ward-10',
    number: 10,
    name: 'Lakeside Enclave',
    nameHi: 'लेकसाइड एन्क्लेव',
    nameMr: 'लेकसाइड एन्क्लेव्ह',
    elevation: 8.2,
    population: 18300,
    vulnerablePopulation: 2500,
    drainCapacity: 52,
    distanceToRiver: 480,
    centroid: { x: 390, y: 460 },
    svgPolygon: "280,340 380,350 490,460 370,440",
  },
  {
    id: 'ward-11',
    number: 11,
    name: 'Subhash Nagar',
    nameHi: 'सुभाष नगर',
    nameMr: 'सुभाष नगर',
    elevation: 10.4,
    population: 21100,
    vulnerablePopulation: 2700,
    drainCapacity: 58,
    distanceToRiver: 720,
    centroid: { x: 520, y: 460 },
    svgPolygon: "380,350 520,360 610,500 490,460",
  },
  {
    id: 'ward-12',
    number: 12,
    name: 'East Gateway Park',
    nameHi: 'ईस्ट गेटवे पार्क',
    nameMr: 'पूर्व प्रवेशद्वार पार्क',
    elevation: 15.1,
    population: 16800,
    vulnerablePopulation: 1800,
    drainCapacity: 78,
    distanceToRiver: 950,
    centroid: { x: 670, y: 490 },
    svgPolygon: "580,410 780,410 760,570 590,560",
  }
];

export const rivergateRoads: RoadEdge[] = [
  {
    id: 'road-1',
    name: 'Riverfront Marine Drive (R1)',
    fromWard: 'ward-1',
    toWard: 'ward-3',
    lengthKm: 1.4,
    floodThresholdMm: 35, // Floods early!
    pathPoints: [[170, 160], [140, 240], [190, 310]]
  },
  {
    id: 'road-2',
    name: 'Fort Arterial Avenue (R2)',
    fromWard: 'ward-1',
    toWard: 'ward-2',
    lengthKm: 1.1,
    floodThresholdMm: 65,
    pathPoints: [[170, 160], [215, 170], [260, 180]]
  },
  {
    id: 'road-3',
    name: 'Industrial Link Road (R3)',
    fromWard: 'ward-3',
    toWard: 'ward-4',
    lengthKm: 1.3,
    floodThresholdMm: 45,
    pathPoints: [[190, 310], [250, 315], [310, 310]]
  },
  {
    id: 'road-4',
    name: 'Bazaar Crossway (R4)',
    fromWard: 'ward-2',
    toWard: 'ward-4',
    lengthKm: 1.2,
    floodThresholdMm: 70,
    pathPoints: [[260, 180], [285, 245], [310, 310]]
  },
  {
    id: 'road-5',
    name: 'Civil Express Way (R5)',
    fromWard: 'ward-2',
    toWard: 'ward-6',
    lengthKm: 2.1,
    floodThresholdMm: 95,
    pathPoints: [[260, 180], [365, 160], [470, 140]]
  },
  {
    id: 'road-6',
    name: 'Station Elevated Flyover (R6)',
    fromWard: 'ward-4',
    toWard: 'ward-7',
    lengthKm: 1.5,
    floodThresholdMm: 80,
    pathPoints: [[310, 310], [380, 310], [450, 310]]
  },
  {
    id: 'road-7',
    name: 'South Canal Causeway (R7)',
    fromWard: 'ward-3',
    toWard: 'ward-9',
    lengthKm: 1.8,
    floodThresholdMm: 40, // Low bridge, floods easily
    pathPoints: [[190, 310], [225, 385], [260, 460]]
  },
  {
    id: 'road-8',
    name: 'Lakeside Ring Road (R8)',
    fromWard: 'ward-9',
    toWard: 'ward-10',
    lengthKm: 1.4,
    floodThresholdMm: 55,
    pathPoints: [[260, 460], [325, 460], [390, 460]]
  },
  {
    id: 'road-9',
    name: 'Central Spine Road (R9)',
    fromWard: 'ward-7',
    toWard: 'ward-11',
    lengthKm: 1.7,
    floodThresholdMm: 85,
    pathPoints: [[450, 310], [485, 385], [520, 460]]
  },
  {
    id: 'road-10',
    name: 'Ridge Ascent Highway (R10)',
    fromWard: 'ward-6',
    toWard: 'ward-5',
    lengthKm: 2.2,
    floodThresholdMm: 160, // Safe high ridge
    pathPoints: [[470, 140], [570, 160], [670, 180]]
  },
  {
    id: 'road-11',
    name: 'University Safe Corridor (R11)',
    fromWard: 'ward-7',
    toWard: 'ward-8',
    lengthKm: 2.4,
    floodThresholdMm: 140, // Well drained
    pathPoints: [[450, 310], [565, 325], [680, 340]]
  },
  {
    id: 'road-12',
    name: 'East Gateway Connector (R12)',
    fromWard: 'ward-11',
    toWard: 'ward-12',
    lengthKm: 1.6,
    floodThresholdMm: 130,
    pathPoints: [[520, 460], [595, 475], [670, 490]]
  },
  {
    id: 'road-13',
    name: 'Ridge Eastern Bypass (R13)',
    fromWard: 'ward-8',
    toWard: 'ward-12',
    lengthKm: 1.8,
    floodThresholdMm: 180,
    pathPoints: [[680, 340], [675, 415], [670, 490]]
  }
];

export const rivergateDepots: Depot[] = [
  {
    id: 'depot-north',
    name: 'North Civil Equipment Depot',
    wardId: 'ward-6',
    coordinates: { x: 470, y: 140 }
  },
  {
    id: 'depot-south',
    name: 'South Sector Logistics Depot',
    wardId: 'ward-11',
    coordinates: { x: 520, y: 460 }
  }
];

export const rivergateResources: ResourceItem[] = [
  { id: 'pump-1', name: 'High-Volume Dewatering Pump P1', type: 'pump', capacityRate: '12,000 L/min', assignedWardId: 'ward-6', baseDepotId: 'depot-north', status: 'available' },
  { id: 'pump-2', name: 'High-Volume Dewatering Pump P2', type: 'pump', capacityRate: '12,000 L/min', assignedWardId: 'ward-6', baseDepotId: 'depot-north', status: 'available' },
  { id: 'pump-3', name: 'Submersible Pump P3', type: 'pump', capacityRate: '8,000 L/min', assignedWardId: 'ward-1', baseDepotId: 'depot-north', status: 'deployed' },
  { id: 'pump-4', name: 'Submersible Pump P4', type: 'pump', capacityRate: '8,000 L/min', assignedWardId: 'ward-11', baseDepotId: 'depot-south', status: 'available' },
  { id: 'pump-5', name: 'Trailer Dewatering Pump P5', type: 'pump', capacityRate: '15,000 L/min', assignedWardId: 'ward-11', baseDepotId: 'depot-south', status: 'available' },
  { id: 'pump-6', name: 'Trailer Dewatering Pump P6', type: 'pump', capacityRate: '15,000 L/min', assignedWardId: 'ward-7', baseDepotId: 'depot-north', status: 'deployed' },
  
  { id: 'boat-1', name: 'Inflatable Rescue Boat B1 (Bravo)', type: 'boat', capacityRate: '12 persons', assignedWardId: 'ward-3', baseDepotId: 'depot-north', status: 'deployed' },
  { id: 'boat-2', name: 'Inflatable Rescue Boat B2 (Delta)', type: 'boat', capacityRate: '12 persons', assignedWardId: 'ward-6', baseDepotId: 'depot-north', status: 'available' },
  { id: 'boat-3', name: 'Fiberglass Swiftwater Boat B3', type: 'boat', capacityRate: '8 persons', assignedWardId: 'ward-9', baseDepotId: 'depot-south', status: 'deployed' },
  { id: 'boat-4', name: 'Rigid Hull Rescue Craft B4', type: 'boat', capacityRate: '14 persons', assignedWardId: 'ward-11', baseDepotId: 'depot-south', status: 'available' },

  { id: 'team-1', name: 'Alpha Swiftwater Rescue Unit', type: 'rescue_team', capacityRate: '6 divers & paramedics', assignedWardId: 'ward-3', baseDepotId: 'depot-north', status: 'deployed' },
  { id: 'team-2', name: 'Bravo Urban Flood Squad', type: 'rescue_team', capacityRate: '8 specialists', assignedWardId: 'ward-6', baseDepotId: 'depot-north', status: 'available' },
  { id: 'team-3', name: 'Delta Structural Extraction Team', type: 'rescue_team', capacityRate: '6 specialists', assignedWardId: 'ward-11', baseDepotId: 'depot-south', status: 'available' },

  { id: 'amb-1', name: 'High-Axle 4x4 Ambulance A1', type: 'ambulance', capacityRate: '2 stretchers', assignedWardId: 'ward-6', baseDepotId: 'depot-north', status: 'available' },
  { id: 'amb-2', name: 'High-Axle 4x4 Ambulance A2', type: 'ambulance', capacityRate: '2 stretchers', assignedWardId: 'ward-1', baseDepotId: 'depot-north', status: 'deployed' },
  { id: 'amb-3', name: 'Standard Trauma Ambulance A3', type: 'ambulance', capacityRate: '2 stretchers', assignedWardId: 'ward-7', baseDepotId: 'depot-north', status: 'available' },
  { id: 'amb-4', name: 'Standard Trauma Ambulance A4', type: 'ambulance', capacityRate: '2 stretchers', assignedWardId: 'ward-11', baseDepotId: 'depot-south', status: 'available' },
  { id: 'amb-5', name: 'High-Axle 4x4 Ambulance A5', type: 'ambulance', capacityRate: '2 stretchers', assignedWardId: 'ward-12', baseDepotId: 'depot-south', status: 'available' }
];

export const rivergateCamps: ReliefCamp[] = [
  {
    id: 'camp-b',
    code: 'CAMP-B',
    name: 'Greenfield Stadium Shelter',
    nameHi: 'ग्रीनफील्ड स्टेडियम राहत शिविर',
    nameMr: 'ग्रीनफिल्ड स्टेडियम मदत शिबिर',
    wardId: 'ward-5',
    coordinates: { x: 670, y: 180 },
    totalCapacity: 1800,
    currentOccupancy: 740,
    foodPackets: 3200,
    drinkingWaterLiters: 9500,
    medicalKits: 140,
    hourlyFoodBurnRate: 0.12, // packets per person-hr
    hourlyWaterBurnRate: 0.35 // liters per person-hr
  },
  {
    id: 'camp-a',
    code: 'CAMP-A',
    name: 'Highridge Campus Arena',
    nameHi: 'हाईरिज कैंपस एरेना आश्रय',
    nameMr: 'हायरीज कॅम्पस आश्रय शिबिर',
    wardId: 'ward-8',
    coordinates: { x: 680, y: 340 },
    totalCapacity: 1200,
    currentOccupancy: 410,
    foodPackets: 2400,
    drinkingWaterLiters: 7200,
    medicalKits: 95,
    hourlyFoodBurnRate: 0.12,
    hourlyWaterBurnRate: 0.35
  },
  {
    id: 'camp-c',
    code: 'CAMP-C',
    name: 'East Gate Polytechnic Center',
    nameHi: 'ईस्ट गेट पॉलिटेक्निक केंद्र',
    nameMr: 'पूर्व प्रवेशद्वार तंत्रनिकेतन केंद्र',
    wardId: 'ward-12',
    coordinates: { x: 670, y: 490 },
    totalCapacity: 1000,
    currentOccupancy: 280,
    foodPackets: 1900,
    drinkingWaterLiters: 5800,
    medicalKits: 80,
    hourlyFoodBurnRate: 0.12,
    hourlyWaterBurnRate: 0.35
  },
  {
    id: 'camp-d',
    code: 'CAMP-D',
    name: 'North Civil Community Hall',
    nameHi: 'सिविल लाइन्स सामुदायिक भवन',
    nameMr: 'सिव्हिल लाइन्स समाज मंदिर',
    wardId: 'ward-6',
    coordinates: { x: 470, y: 140 },
    totalCapacity: 800,
    currentOccupancy: 530,
    foodPackets: 1100,
    drinkingWaterLiters: 3400,
    medicalKits: 60,
    hourlyFoodBurnRate: 0.12,
    hourlyWaterBurnRate: 0.35
  }
];
