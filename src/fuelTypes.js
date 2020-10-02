const regUnleadedStrings = ['gasoline', 'premium gasoline', 'regular gasoline', 'midgrade gasoline', 'petrol']
const dieselStrings = ['diesel']
const LPGStrings = ['lpg']
const naturalGasStrings = ['natural gas']
const electricStrings = ['electricity']


const dbFuels = {
  regUnleaded: 'Petrol',
  diesel: 'Diesel',
  lpg: 'LPG',
  naturalGas: 'Natural Gas',
  electric: 'Electric',
}


export function findFuel(fuelRaw){
  let fuelLwr=fuelRaw.toLowerCase()
  let fuelNorm

  if(regUnleadedStrings.includes(fuelLwr)){
    fuelNorm = (dbFuels.regUnleaded)
  } else if(dieselStrings.includes(fuelLwr)){
    fuelNorm = (dbFuels.diesel)
  }else if(LPGStrings.includes(fuelLwr)){
    fuelNorm = (dbFuels.lpg)
  }else if(naturalGasStrings.includes(fuelLwr)){
    fuelNorm = (dbFuels.naturalGas)
  } else if(electricStrings.includes(fuelLwr)){
    fuelNorm = (dbFuels.electric)
  }else {
    fuelNorm = (`Fuel ${fuelRaw} not found.`)
  }
  return fuelNorm
}