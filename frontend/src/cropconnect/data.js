// CropConnect Smart Farming IoT — component data, spatial layout & connection graph.
// getPos(id, f) = base + explode * f  (f in 0..1)

export const HOME_CAMERA = { position: [5.2, 3.4, 6.2], target: [0, 1.4, 0] };

// base = assembled position, off = explode offset vector, rot = optional rotation (radians)
export const LAYOUT = {
  body:      { base: [0, 1.5, 0],        off: [0, 0, 0] },
  lid:       { base: [0, 1.5, 0.48],     off: [0, 0, 2.9] },
  solar:     { base: [0, 2.52, -0.02],   off: [0, 1.5, 0.2],  rot: [-0.34, 0, 0] },
  plate:     { base: [0, 1.5, -0.30],    off: [0, 0, 0.55] },
  esp32:     { base: [0.05, 1.48, -0.10],off: [0, -0.05, 1.15] },
  sim:       { base: [-0.62, 1.9, -0.10],off: [-0.4, 0.28, 1.6] },
  max485:    { base: [0.74, 1.86, -0.10],off: [0.5, 0.16, 1.6] },
  relay:     { base: [0.62, 1.10, -0.10],off: [0.5, -0.28, 1.55] },
  buck:      { base: [-0.68, 1.10, -0.10],off: [-0.45, -0.28, 1.55] },
  dht22:     { base: [1.62, 1.30, 0.28], off: [0.8, 0, 0.1],  rot: [0, 0, 0] },
  npk:       { base: [1.75, 0.02, 0.95], off: [0.4, 0, 0.35] },
  ph:        { base: [2.4, 0.02, 0.55],  off: [0.4, 0, 0.2] },
  moisture1: { base: [-1.5, 0.02, 1.05], off: [-0.2, 0, 0.25] },
  moisture2: { base: [-2.05, 0.02, 0.6], off: [-0.35, 0, 0.1] },
  moisture3: { base: [-2.55, 0.02, 1.1], off: [-0.5, 0, 0.25] },
  rain:      { base: [-1.15, 1.9, -0.7], off: [-0.5, 0.35, 0], rot: [-0.5, 0.3, 0] },
  waterlevel:{ base: [2.75, 0.04, -0.95],off: [0.45, 0, -0.25] },
  flow:      { base: [0.6, 0.2, -1.55],  off: [0, 0.25, -0.35] },
};

export function getPos(id, f = 0) {
  const l = LAYOUT[id];
  if (!l) return [0, 0, 0];
  return [
    l.base[0] + l.off[0] * f,
    l.base[1] + l.off[1] * f,
    l.base[2] + l.off[2] * f,
  ];
}

// Parts that appear in the exploded stack (in order of separation)
export const EXPLODE_ORDER = [
  'solar', 'lid', 'plate', 'esp32', 'sim', 'max485', 'relay', 'buck',
];

// Clickable components with full info-panel content
export const COMPONENTS = {
  body: {
    name: 'CROPCONNECT UNIT', subtitle: 'Smart Farming IoT Field Unit',
    role: 'Solar-Powered Field Node',
    purpose: 'A weather-resistant, solar-powered agricultural sensing and control unit that collects soil and environmental data, communicates over 4G with the Edge AI system, and drives intelligent irrigation.',
    inputs: ['Soil moisture', 'Temperature', 'Humidity', 'Soil pH', 'NPK nutrients', 'Rain', 'Water level', 'Flow'],
    outputs: ['4G field data sync', 'Relay / pump control'],
    connectsTo: [],
    color: '#37c871',
  },
  solar: {
    name: 'SOLAR PANEL', subtitle: 'Power Generation',
    role: 'Renewable Power Source',
    purpose: 'A photovoltaic panel that charges the battery through the power-management stage, keeping the field unit running off-grid.',
    inputs: ['Sunlight'],
    outputs: ['DC power → charge / power management → battery → buck converters'],
    connectsTo: ['buck'],
    color: '#3ba7ff',
  },
  lid: {
    name: 'ENCLOSURE LID', subtitle: 'Weatherproof Cover',
    role: 'Environmental Protection',
    purpose: 'Screw-mounted, gasket-sealed lid that keeps rain, dust and UV out of the electronics compartment while allowing service access.',
    inputs: [], outputs: [], connectsTo: [], color: '#5fae7f',
  },
  plate: {
    name: 'MOUNTING PLATE', subtitle: 'Internal Chassis',
    role: 'Component Mounting',
    purpose: 'Rigid mounting plate that holds and organises all internal PCBs, keeping wiring tidy and serviceable.',
    inputs: [], outputs: [], connectsTo: [], color: '#9aa2ab',
  },
  esp32: {
    name: 'ESP32', subtitle: 'Field Controller',
    role: 'Field Controller',
    purpose: 'Main field controller responsible for collecting sensor readings, communicating with the Edge AI system and controlling field actuators.',
    inputs: ['Moisture', 'Temperature', 'Humidity', 'pH', 'NPK (via MAX485)', 'Rain', 'Water Level'],
    outputs: ['Relay control', 'Edge AI communication (via 4G)'],
    connectsTo: ['dht22', 'moisture1', 'moisture2', 'moisture3', 'ph', 'max485', 'rain', 'waterlevel', 'relay', 'sim'],
    color: '#37c871',
  },
  sim: {
    name: 'SIM A7670C', subtitle: '4G Communication',
    role: 'Cellular Connectivity',
    purpose: 'Provides cellular connectivity for remote alerts, synchronization and remote communication when local internet connectivity is unavailable.',
    inputs: ['Serial / power from ESP32'],
    outputs: ['4G / LTE uplink to Edge AI & cloud'],
    connectsTo: ['esp32'],
    color: '#3ba7ff',
  },
  max485: {
    name: 'MAX485', subtitle: 'RS485 Interface',
    role: 'RS485 → Serial Bridge',
    purpose: 'Converts the RS485 communication from the NPK sensor into a serial interface suitable for the ESP32.',
    inputs: ['RS485 from NPK sensor'],
    outputs: ['UART serial → ESP32'],
    connectsTo: ['npk', 'esp32'],
    color: '#ffb43b',
  },
  relay: {
    name: 'RELAY', subtitle: 'Actuator Control',
    role: 'Actuator Control',
    purpose: 'Provides electrical isolation and switching between the low-voltage ESP32 and higher-power irrigation equipment such as pumps or valves.',
    inputs: ['Control signal from ESP32'],
    outputs: ['Switched power → pump / valve'],
    connectsTo: ['esp32', 'flow'],
    color: '#ff6b6b',
  },
  buck: {
    name: 'BUCK CONVERTERS', subtitle: 'Power Management',
    role: 'Voltage Regulation',
    purpose: 'Step-down regulators and power distribution that supply stable, regulated voltages to the ESP32, sensors and the 4G module.',
    inputs: ['Battery / solar power'],
    outputs: ['Regulated 3.3V / 5V rails'],
    connectsTo: ['esp32', 'solar'],
    color: '#c58bff',
  },
  dht22: {
    name: 'DHT22', subtitle: 'Temperature + Humidity',
    role: 'Environmental Sensing',
    purpose: 'Measures ambient temperature and relative humidity to provide environmental context for crop health and heat-stress assessment. Mounted in a ventilated housing outside the sealed compartment.',
    inputs: ['Ambient air'],
    outputs: ['Temperature & humidity → ESP32'],
    connectsTo: ['esp32'],
    color: '#37c871',
  },
  npk: {
    name: 'NPK SENSOR', subtitle: 'Soil Nutrient Monitor',
    role: 'Nutrient Monitoring',
    purpose: 'Measures soil nutrient parameters such as nitrogen, phosphorus and potassium and provides nutrient-related field data to CropConnect. It provides field data — not a standalone diagnosis of plant deficiency.',
    inputs: ['Soil (nutrient probe)'],
    outputs: ['RS485 → MAX485 → ESP32'],
    connectsTo: ['max485'],
    color: '#ffb43b',
  },
  ph: {
    name: 'SOIL pH', subtitle: 'pH Probe + Interface',
    role: 'Soil Acidity Sensing',
    purpose: 'Measures soil acidity or alkalinity and provides soil-condition context for crop and nutrient recommendations. The probe extends into the soil; a signal-conditioning module feeds the ESP32.',
    inputs: ['Soil (pH probe)'],
    outputs: ['Analog signal → interface → ESP32'],
    connectsTo: ['esp32'],
    color: '#e05fa0',
  },
  moisture1: {
    name: 'SOIL MOISTURE — ZONE 1', subtitle: 'Capacitive Moisture Sensor',
    role: 'Moisture Sensing (Zone 1)',
    purpose: 'Measures soil moisture in field zone 1 to identify moisture conditions, trends and irrigation requirements. Multiple zones sample representative points — they do not fully cover a whole acre.',
    inputs: ['Soil (zone 1)'], outputs: ['Analog moisture → ESP32'],
    connectsTo: ['esp32'], color: '#37c871',
  },
  moisture2: {
    name: 'SOIL MOISTURE — ZONE 2', subtitle: 'Capacitive Moisture Sensor',
    role: 'Moisture Sensing (Zone 2)',
    purpose: 'Measures soil moisture in field zone 2 to identify moisture conditions, trends and irrigation requirements.',
    inputs: ['Soil (zone 2)'], outputs: ['Analog moisture → ESP32'],
    connectsTo: ['esp32'], color: '#37c871',
  },
  moisture3: {
    name: 'SOIL MOISTURE — ZONE 3', subtitle: 'Capacitive Moisture Sensor',
    role: 'Moisture Sensing (Zone 3)',
    purpose: 'Measures soil moisture in field zone 3 to identify moisture conditions, trends and irrigation requirements.',
    inputs: ['Soil (zone 3)'], outputs: ['Analog moisture → ESP32'],
    connectsTo: ['esp32'], color: '#37c871',
  },
  rain: {
    name: 'RAIN SENSOR', subtitle: 'Rainfall Detection',
    role: 'Rainfall Detection',
    purpose: 'Provides local rainfall detection that can be combined with soil moisture and irrigation history to improve irrigation decisions and environmental risk assessment.',
    inputs: ['Rainfall on detection plate'], outputs: ['Rain state → ESP32'],
    connectsTo: ['esp32'], color: '#3ba7ff',
  },
  waterlevel: {
    name: 'WATER LEVEL', subtitle: 'Water Accumulation Sensor',
    role: 'Flood / Waterlogging Detection',
    purpose: 'Detects abnormal water accumulation at a low point and contributes to flood and waterlogging risk assessment.',
    inputs: ['Water at low point'], outputs: ['Level signal → ESP32'],
    connectsTo: ['esp32'], color: '#3ba7ff',
  },
  flow: {
    name: 'FLOW SENSOR', subtitle: 'Irrigation Verification',
    role: 'Irrigation Verification',
    purpose: 'Measures irrigation flow and verifies that water is actually being delivered after an irrigation command.',
    inputs: ['Water flow in pipe'], outputs: ['Flow pulses → ESP32'],
    connectsTo: ['relay'], color: '#3ba7ff',
  },
};

export const CLICKABLE = Object.keys(COMPONENTS);

// External cable labels around the enclosure
export const CABLE_LABELS = [
  'SOIL MOISTURE ZONE 1', 'SOIL MOISTURE ZONE 2', 'SOIL MOISTURE ZONE 3',
  'NPK', 'pH', 'DHT22', 'RAIN', 'WATER LEVEL', 'FLOW', '4G ANTENNA', 'PUMP / VALVE', 'POWER',
];

// Sensor cables: sensor id -> gland x offset on enclosure bottom, wire color
export const CABLES = [
  { to: 'moisture1', gland: [-0.7, 0.78, 0.35], color: '#2f8f4f' },
  { to: 'moisture2', gland: [-0.5, 0.78, 0.35], color: '#2f8f4f' },
  { to: 'moisture3', gland: [-0.3, 0.78, 0.35], color: '#2f8f4f' },
  { to: 'npk',       gland: [0.3, 0.78, 0.35],  color: '#c9902f' },
  { to: 'ph',        gland: [0.5, 0.78, 0.35],  color: '#d15f9a' },
  { to: 'dht22',     gland: [0.85, 1.30, 0.2],  color: '#dddddd' },
  { to: 'rain',      gland: [-0.85, 1.35, -0.2],color: '#3a7fc0' },
  { to: 'waterlevel',gland: [0.85, 0.78, -0.25],color: '#3a7fc0' },
  { to: 'flow',      gland: [0.1, 0.78, -0.35], color: '#3a7fc0' },
];

// System flow (SHOW SYSTEM FLOW)
export const SYSTEM_FLOW = [
  'SENSORS', 'ESP32', 'EDGE AI', 'RISK ENGINE', 'DECISION',
  'RELAY / PUMP', 'FLOW SENSOR', 'VERIFICATION',
];

export const HOW_IT_WORKS = [
  'Sensors collect field conditions.',
  'ESP32 gathers and transmits the readings.',
  'Edge AI analyses field data and camera information.',
  'CropConnect calculates agricultural risks.',
  'The Decision Engine recommends or triggers an action.',
  'The relay controls irrigation equipment.',
  'Flow sensing verifies the irrigation action.',
  'The event is stored in farm history.',
];
