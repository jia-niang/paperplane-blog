const base64UrlAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

function base64UrlEncode(num) {
  let result = ''
  do {
    result = base64UrlAlphabet[num % 64] + result
    num = Math.floor(num / 64)
  } while (num > 0)

  return result
}

function base64UrlDecode(str) {
  let result = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i)
    const index = base64UrlAlphabet.indexOf(char)
    const power = str.length - i - 1
    result += index * Math.pow(64, power)
  }

  return result
}
