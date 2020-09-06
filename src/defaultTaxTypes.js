
/*
Define category titles, which will appear to the user in the definitions of their tax types.
Category titles may change in the future.
All js code should point towards the category type, which should remain unchanged, but not visible to the user.
Title - visible to user.
Type - Visible to code
*/

import {ROAD, AIR, OTHER} from './constants.js';
import {RECREATIONAL, ESSENTIAL, AIR_TRAVEL} from './constants.js';

export const TAX_RATE_DECIMALS = 5

export const taxCategories = [
  {title: "Driving", type:ROAD},
  {title: "Flying", type:AIR},
  {title: "Other", type:OTHER},
]

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
      {name: "Recreational Driving", category: getCategoryName(ROAD), price:0.13},
      {name: "Essential Driving", category: getCategoryName(ROAD), price:0.045},
      {name: "Air - Leisure", category: getCategoryName(AIR), price:0.045},
      {name: "Air - Business", category: getCategoryName(AIR), price:0.05},
    ]