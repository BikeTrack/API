const bcrypt = require('bcrypt')

const saltRounds = 10

module.exports.hash = function hash(password) {
  console.log(`TTTEEEEEESSSSSTTTTTT ${password}`);
  bcrypt.hash(password, saltRounds, (err, salt) => {
    console.log(`Error => ${err}`);
    if (err) throw err
    console.log(`Pass: ${password} / Salt: ${salt}`);
    return salt
  })
}

module.exports.compare = function compare(password, hash) {
  bcrypt.compare(password, hash, (err, res) => {
    if (err) throw err
    return res
  })
}
