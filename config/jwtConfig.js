const passportJWT   = require("passport-jwt")
const ExtractJwt    = passportJWT.ExtractJwt

var jwtConfig = {}
// change fromAuthHeader with fromHeader(header_name)
jwtConfig.jwtFromRequest = ExtractJwt.fromHeader('token') // check if doesn't colide with APII Auth Header
// jwtConfig.jwtFromRequest = ExtractJwt.fromAuthHeader() // check if doesn't colide with APII Auth Header
jwtConfig.secretOrKey = '-TuDors+TuEsFort'

module.exports = jwtConfig
