/* Constants and methods for unit conversions */

/*
MISC METHODS
 - toggle

DISTANCE METHODS
 - distanceDisplay
 - distanceString
 - convertToKm

ECONOMY METHODS
 - convertFromMetricToDisplayUnits(aka convert())
 - convertFromDisplayUnits(equivalent to convert())
 - USMpgToMetric
 - displayUnitString(aka string())
*/

export const US = "mpgUS";
export const UK = "mpgUK";
export const METRIC = "lPer100Km";

const USmpgToMetric = 100*3.785411784/1.609344
const UStoUKGallon = 1.201
const mileToKm = 1.609344

export const allUnits = [
  {
    str: US,
    label: string(US)
  },
  {
    str: UK,
    label: string(UK)
  },
  {
    str:METRIC,
    label: string(METRIC)
  },
]

//*********** Shorthand Methods ***************
export function string(displayUnits){
  return(displayUnitString(displayUnits))
}
export function convert(val, units){
  return(convertFromMetricToDisplayUnits(val,units))
}

//*********** Misc Methods ***************
export function toggle(units){
  if(units===METRIC){
    return US
  } else if(units===US){
    return UK
  } else if(UK){
    return METRIC    
  }
}

//*********** Distance Methods ***************
export function distanceDisplay(value, displayUnits){
  if (displayUnits === METRIC){
    return value;
  } else if (displayUnits === UK){
    return value/mileToKm
  } else if (displayUnits === US){
    return value/mileToKm
  } else {
    console.log("Unknown economy units.")
    return 0;
  }
}

export function distanceString(displayUnits){
  if (displayUnits === METRIC){
    return "km";
  } else if (displayUnits === UK){
    return "mi"
  } else if (displayUnits === US){
    return "mi"
  } else {
    return "??";
  }
}

export function convertToKm(value, displayUnits){
    if(displayUnits===METRIC){
      return value;
    } else {
      return value*mileToKm;
    }
  }

//*********** Economy Methods ***************
export function convertFromMetricToDisplayUnits(value, displayUnits){
  // Shorthand: convert(val, units)
  if (displayUnits === METRIC){
    return value;
  } else if (displayUnits === UK){
    return UStoUKGallon*USmpgToMetric/value
  } else if (displayUnits === US){
    return USmpgToMetric/value
  } else {
    console.log("Unknown economy units.")
    return 0;
  }
}

/* Note: convertToDisplay and convertFromDisplay are the same thing (inverse relation of units)*/
export function convertFromDisplayUnits(value, displayUnits){
  return(convertFromMetricToDisplayUnits(value, displayUnits))
}

export function USMpgToMetric(value){
  return USmpgToMetric/value;
}

export function displayUnitString(displayUnits){
  // Shorthand: string(units)
  if (displayUnits === METRIC){
    return "L/100km";
  } else if (displayUnits === UK){
    return "UK mpg";
  } else if (displayUnits === US){
    return "US mpg";
  } else {
    return "Unknown economy units.";
  }
}