const _             = require("lodash")
const passportJWT   = require("passport-jwt")
const JwtStrategy   = passportJWT.Strategy

module.exports = (passport, jwtOptions, users) => {
  const strategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
    console.log('payload received', jwt_payload)
    // usually this would be a database call:
    const user = users[_.findIndex(users, {id: jwt_payload.id})];
    if (user) {
      next(null, user);
    }else{
      next(null, false);
    }
  })
  passport.use(strategy)
}
