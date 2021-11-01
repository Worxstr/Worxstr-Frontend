/*
Ensure that an input string is non-empty. Usage ex.:
rules: {
  name: [exists('You must enter a name')]
}
*/
export const exists = (errorMessage: string) => (value: string | number) => {
  if (typeof(value) === 'number') return value === 0 ? true : !!value
  return !!value || errorMessage
}

export const matches = (errorMessage: string) => (val1: string, val2: string) => {
  return (
    val1 == val2 || errorMessage
  );
}

// TODO: Use a library for these regex rules

export const emailRules = [
  (value: string) => !!value || "Email required",
  (value: string) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return pattern.test(value) || "Invalid email"
  },
]

export const passwordRules = [
  (value: string) => !!value || "Password required",
  (value: string) => value.length >= 8 || "Password must be 8 characters",
]

export const passwordMatches = matches('Passwords must match')

export const phone = (optional: boolean) => (value: string) => {
  const pattern = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/
  if (optional && !value) return true
  return pattern.test(value) || "Invalid phone"
}

export const phoneRulesOptional = [
  phone(true)
]
export const phoneRules = [
  (value: string) => !!value || "Phone required",
  phone(false),
]

export const url = (value: string) => {
  if (!value.length) return true
  const pattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/
  return pattern.test(value) || "Invalid url"
}

export const shortSsnRules = [
  exists("SSN required"),
  (value: string) => {
    const pattern = /^\d{4}$/
    return pattern.test(value) || "Invalid SSN"
  }
]

export const ssnRules = [
  exists("SSN required"),
  (value: string) => {
    const pattern = /^\d{9}$/
    return pattern.test(value) || "Invalid SSN"
  }
]


export const ssnMatches = matches('SSNs must match')

export const einRules = [
  exists("EIN required"),
  (value: string) => {
    const pattern = /^\d{2}-\d{7}$/
    return pattern.test(value) || "Invalid EIN"
  }
]

export const postalCodeRules = [
  exists("Postal code required"),
  (value: string) => {
    const pattern = /^\d{5}(-\d{4})?$/
    return pattern.test(value) || "Invalid postal code"
  }
]

export const currency = (value: string) => {
  // https://regexlib.com/Search.aspx?k=currency&c=-1&m=5&ps=20
  const parsed = parseFloat(value)
  if (isNaN(parsed) || parsed == 0) return 'Invalid amount'
  const pattern = /^\$?-?([1-9]{1}[0-9]{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^-?\$?([1-9]{1}\d{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\(\$?([1-9]{1}\d{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))\)$/
  return pattern.test(value.replace(/^0+/, '')) || "Invalid amount"
}