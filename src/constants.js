import * as units from './unitConversions.js';

//Default setttings
export const DEFAULT_CURRENCY = "AUD"
export const DEFAULT_CURRENCY_SYMBOL = "$"
export const DEFAULT_DISPLAY_UNITS = units.METRIC
export const DEFAULT_VEHICLE_NAME = "My Vehicle"


//Constants defined in views.py - Both sources must be changed and migration applied.
export const MAX_VEHICLE_NAME_LEN = 30
export const MAX_EMISSION_NAME_LEN = 60

export const MAX_LEN_RECIP_NAME = 60
export const MAX_LEN_RECIP_COUNTRY = 60
export const MAX_LEN_RECIP_WEB_LINK = 100
export const MAX_LEN_RECIP_DONATION_LINK = 100
export const MAX_LEN_RECIP_CURRENCY = 10
export const MAX_LEN_RECIP_DESCRIPTION = 1000 //Undefined in views.py