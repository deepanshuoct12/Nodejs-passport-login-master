const LocalStrategy = require('passport-local').Strategy // we are using local version of passport i.e not like we can login from  gmail etc. 

const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {    // this function is called to chk for authentication
    const user = getUserByEmail(email)    //call getuserby email f'n 
    if (user == null) {   // if user is not find
      return done(null, false, { message: 'No user with that email' })  // null error,false means user is not found and then send the error msg
    }

    try {
      if (await bcrypt.compare(password, user.password)) {   // if user is found then chk for password
        return done(null, user)   // return user if found
      } else {
        return done(null, false, { message: 'Password incorrect' })    // user is not found
      }
    } catch (e) {
      return done(e)  // any error is there call done callback
    }
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))  // using new local stratergy we take email ,password and then call authen.f'n 
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
}

module.exports = initialize