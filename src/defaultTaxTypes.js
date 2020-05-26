
/*
Define category titles, which will appear to the user in the definitions of their tax types.
Category titles may change in the future.
All js code should point towards the category type, which should remain unchanged, but not visible to the user.
Title - visible to user.
Type - Visible to code
*/



export const taxCategories = [
  {title: "Driving", type:"road-travel"},
  {title: "Flying", type:"air-travel"},
  {title: "Other", type:"other"},
]

export const taxNames = [
  {name: "Recreational Driving", type:"rec-driving"},
  {name: "Essential Driving", type:"ess-driving"},
  {name: "Air Travel", type:"air-travel"},
]

export function getTaxName(type){
  for(let i in taxNames){
    if(taxNames[i].type===type){
      return taxNames[i].name;
    }
  }
  return "Unexpected tax name"
}

export function getCategoryName(type){
  for(let i in taxCategories){
    if(taxCategories[i].type===type){
      return taxCategories[i].title;
    }
  }
  return "Unexpected category type"
}

/*
A list of all default taxes that a new user should inherit.
Method should later include a different price depending on location/currency.
*/
export const defaultTaxes = [
      {name: getTaxName("rec-driving"), category: getCategoryName("road-travel"), price:0.13},
      {name: getTaxName("ess-driving"), category: getCategoryName("road-travel"), price:0.45},
      {name: getTaxName("air-travel"), category: getCategoryName("air-travel"), price:0.45}
    ]