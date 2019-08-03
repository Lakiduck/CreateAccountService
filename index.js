const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dbConnectConfig = require('./dbConfig');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

app.use(passport.initialize());

app.use(passport.session());

app.use(session({ secret: "cats" }));

var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(urlencodedParser);

mongoose.connect(dbConnectConfig.dbString, {useNewUrlParser: true});

mongoose.set('useCreateIndex', true);

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {type: String},
  email: {type: String},
  password: {type: String}
});


const User = mongoose.model('User', UserSchema);

app.set('view engine', 'ejs');

app.use(express.static('public'));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


passport.use(new LocalStrategy({
  usernameField: 'email'
  },
  function(username, password, done){
    User.findOne({email: username}, function(err, user){
      if(err){
        return done(err);
      }
      if(!user){
        return done(null, false, {message: 'Incorrect username.'});
      }
      if(user.password !== password){
        return done(null, false, {message: 'Incorrect password.'});
      }
      return done(null, user);
    });
  }
));

app.get('/', function(req, res){
    res.redirect('/login');
});

app.get('/login', function(req, res){
  res.render('login');
});

app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), function(req, res){
  res.render('authenticated');
});


app.get('/createaccount', function(req, res){
  res.render('createAccount');
});

app.get('/accountdashboard', function(req, res){
  User.find({}, function(err, data){
    if(err){
      throw err;
    }
    res.render('accountdashboard', {users: data});
  });
});

app.post('/accountdashboard', urlencodedParser ,function(req, res){
  User.findOne({email: req.body.search}).then(function(result){
      res.render('searchedAccount', {user: result});
  });
});

app.post('/createaccount', urlencodedParser, function(req, res){
  console.log(req.body);
  if(req.body.password === req.body.confirm){
    res.render('success', {user: req.body});
    User(req.body).save(function(err, data){
      if(err){
        throw err;
      }
    });
  } else {
    res.send('passwords didn\'t match');
  }
});

app.listen(3000);
console.log('listening on port 3000');
