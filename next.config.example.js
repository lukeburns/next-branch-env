// don't hard-code sensitive data in practice
process.env.STAGING_CLIENT_SECRET = 'f5b73b88d0d9d57c831d59c5aa9b09af'
process.env.STAGING_NEXT_PUBLIC_CLIENT_REDIRECT = 'https://staging.vercel.app'

module.exports = require('.')()()

console.log(process.env.CLIENT_SECRET === process.env.STAGING_CLIENT_SECRET) // true
console.log(process.env.NEXT_PUBLIC_CLIENT_REDIRECT === process.env.STAGING_NEXT_PUBLIC_CLIENT_REDIRECT) // true
