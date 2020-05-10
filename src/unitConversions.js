const US = "mpgUS";
const UK = "mpgUK";
const METRIC = "lPer100Km";



const USmpgToMetric = 100*3.785411784/1.609344
const UStoUKGallon = 1.201
const mileToKm = 1.609344

/* SHORTHAND */
export function string(displayUnits){
  return(displayUnitString(displayUnits))
}
export function convert(val, units){
  return(convertFromMetricToDisplayUnits(val,units))
}

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

export function convertFromMetricToDisplayUnits(value, displayUnits){
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

/* Note: convertToDisplay and convertFromDisplay are the same thing*/
export function convertFromDisplayUnits(value, displayUnits){
  return(convertFromMetricToDisplayUnits(value, displayUnits))
}

export function convertFromUSMpgToMetric(value){
  return USmpgToMetric/value;
}

export function displayUnitString(displayUnits){
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