if (process.env.NODE_ENV !== 'production') {  // takes all the environment variable and put in process.env.NODE_ENV
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(    // calling initializepassport f'n in passport-config. lib.
  passport,    // send passort for config.
  email => users.find(user => user.email === email),    // finding user by email
  id => users.find(user => user.id === id)// find user by id
)

const users = []  // instead of having databse we create a local variable to store data

app.set('view-engine', 'ejs')       // ejs syntax will be used here
app.use(express.urlencoded({ extended: false }))
app.use(flash())  // flash is for when login faled  to display message
app.use(session({       // session is used for move across diff. pages
  secret: process.env.SESSION_SECRET,  // it is a secret key that keep our env. variable secret
  resave: false,  // we shouldnt save our session when something jis changed
  saveUninitialized: false //we dont want to save empty value in session when there is no value
}))
app.use(passport.initialize())
app.use(passport.session())      // initialize ,session are f'n of passport
app.use(methodOverride('_method'))  // this lib. is used bcz delete cant be used with form so we override that and use post

app.get('/', checkAuthenticated, (req, res) => {   // final page where we will go after login
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {  // if authenticated go to final page else agin fill details
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({           // pushing data into local variable
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')   // if everything is fine redirect to login page 
  } catch {
    res.redirect('/register')  // if not able to reg. then redirect to reg. page
  }
})

app.delete('/logout', (req, res) => { // we has used override method to use delete method instead of post as delete is not supported  by form
  req.logOut()   // logout is given by passport .it clears out session for user logged in
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {   // if authenticated go to our final page else go back to login pge
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000,()=>{
console.log('server started on ' + 3000)
})