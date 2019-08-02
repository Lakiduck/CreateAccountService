const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dbConnectConfig = require('./dbConfig');

const app = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false })

mongoose.connect(dbConnectConfig.dbString, {useNewUrlParser: true});

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {type: String},
  email: {type: String},
  password: {type: String}
});

const User = mongoose.model('User', UserSchema);

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', function(req, res){
    res.redirect('/login');
});

app.get('/login', function(req, res){
  res.render('login');
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
  console.log(req.body.search);
  var u;
  User.findOne({email: req.body.search}).then(function(result){
      u = result;
      res.render('searchedAccount', {user: u});
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
