import * as units from './unitConversions.js';

export const USER_CACHE = "dynamic-user"

//Default setttings
export const DEFAULT_CURRENCY = "AUD"
export const DEFAULT_CURRENCY_SYMBOL = "$"
export const DEFAULT_DISPLAY_UNITS = units.METRIC
export const DEFAULT_VEHICLE_NAME = "My Vehicle"

export const DEFAULT_MAP_CENTER = {lat: -34.397, lng: 150.644} //Western Syndey


//Constants defined in models.py - Both sources must be changed and migration applied.
export const MAX_VEHICLE_NAME_LEN = 30
export const MAX_EMISSION_NAME_LEN = 60

export const MAX_LEN_USERNAME = 30 //Defined in django docs?
export const MAX_LEN_PASSWORD = 30
export const MAX_LEN_EMAIL = 60
export const MAX_LEN_NAME = 30

export const MAX_LEN_RECIP_NAME = 60
export const MAX_LEN_RECIP_COUNTRY = 60
export const MAX_LEN_RECIP_WEB_LINK = 200
export const MAX_LEN_RECIP_DONATION_LINK = 200
export const MAX_LEN_RECIP_DESCRIPTION = 1000 //Undefined in views.py
export const POSITION_DECIMALS = 10

export const ECONOMY_DECIMALS = 5

export const JET_FUEL_ID = 3

/*export const fuelTypes = [
  {name:"petrol", label:"Petrol", co2_per_L:2.31},
  {name:"diesel", label:"Diesel", co2_per_L:2.5},
]*/

//Naming constants

//Carbon input modes
export const ROAD = "road-travel"
export const AIR = "air-travel"
export const OTHER = "other"
export const PUBLIC = "public-transport"

//Tax categories
export const RECREATIONAL = "rec-driving"
export const ESSENTIAL = "ess-driving"
export const AIR_TRAVEL = "air-travel"


//Static fuel constants
export const AIRLINER_KGCO2_PPAX_LT500 = 0.18
export const AIRLINER_KGCO2_PPAX_GT500 = 0.11

export const aircraftTypes = [
  {type:"airliner", label:"Passenger Airliner"},
  {type:"fixed-wing", label:"Chartered Plane"},
  {type:"helicopter", label:"Helicopter"},
]

export const airlinerClasses = [
  {class:"economy", label:"Economy class"},
  {class:"business", label:"Business class"},
  {class:"firstClass", label:"First class"},
]

export const fareClassMultiplier = {
  economy:0.9,
  business:2.5,
  firstClass:6,
}

export const rfMultiplier = {
  // https://www.bbc.com/news/science-environment-49349566
  lt500Km:1.27,
  gt500Km:2.5,
}

export const emissionSaveFormats = [ 
  "road",
  "airDistance",
  "airTime",
]

export const heliEmissions = {
  // seat<passengers>:kg/hr
  // jet fuel: 9.57kgCO2 per gallon https://www.eia.gov/environment/emissions/co2_vol_mass.php
  seat4:258,    // Bell 206B: 27gal/hr = 258kg/hr, used by Coldstream Helicopters
  seat5:364,   // Bell 206L-4: 38gal/hr = 364kg/hr
  seat6:431,   // Bell 407: 45gal/hr = 431kg/hr, used by Alpine Helicopters Inc
  seat12:957,  // Bell 212HP: 100gal/hr = 947kg/hr, used by Alpine Helicopters Inc
  seat14:1388,  // Bell 214B1: 145gal/hr = 947kg/hr, used by Blackcomb Heli
}




