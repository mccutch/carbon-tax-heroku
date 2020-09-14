//export const PASSWORD_ERR_MESSAGE = "Password must be 8-30 characters, including a number and special character (?!@#$%^&)"
export const PASSWORD_ERR = "Password must be 8-30 characters, including a capital letter and a number."
export const USERNAME_ERR = "Invalid username. Only '.' and '_' characters are allowed."
export const EMAIL_ERR = "Invalid email address format."

export const MAX_PASSWORD_LEN = 30
export const MAX_EMAIL_LEN = 30
export const MAX_NAME_LEN = 30

export function checkPasswordStrength(password){
  //const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!@#$%^&*])(?=.{8,})") 
  const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})")
  return strongRegex.test(password)
}

export function validateEmailRegex(email){
  let emailRegex = new RegExp(".+@.+.[A-Za-z]+$")
  return emailRegex.test(email)
}

export function validateUsernameRegex(username){
  //Username can contain "." or "_" but only one at a time, and not at the ends of the string.
  const validUsername = new RegExp("^(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$")
  return validUsername.test(username)
}