



export function validateEmail(email){
  let emailRegex = new RegExp(".+@.+.[A-Za-z]+$")
  return emailRegex.test(email)
}