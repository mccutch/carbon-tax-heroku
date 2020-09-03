import * as units from './unitConversions.js';

//Default setttings
export const DEFAULT_CURRENCY = "AUD"
export const DEFAULT_CURRENCY_SYMBOL = "$"
export const DEFAULT_DISPLAY_UNITS = units.METRIC
export const DEFAULT_VEHICLE_NAME = "My Vehicle"

export const DEFAULT_MAP_CENTER = {lat: -34.397, lng: 150.644} //Western Syndey


//Constants defined in views.py - Both sources must be changed and migration applied.
export const MAX_VEHICLE_NAME_LEN = 30
export const MAX_EMISSION_NAME_LEN = 60

export const MAX_LEN_RECIP_NAME = 60
export const MAX_LEN_RECIP_COUNTRY = 60
export const MAX_LEN_RECIP_WEB_LINK = 200
export const MAX_LEN_RECIP_DONATION_LINK = 200
export const MAX_LEN_RECIP_DESCRIPTION = 1000 //Undefined in views.py

//Naming constants

//Carbon input modes
export const ROAD = "road-travel"
export const AIR = "air-travel"
export const OTHER = "other"

//Tax categories
export const RECREATIONAL = "rec-driving"
export const ESSENTIAL = "ess-driving"
export const AIR_TRAVEL = "air-travel"