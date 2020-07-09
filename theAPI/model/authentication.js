var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./userSchema.js');

module.exports = function() {
  
  // serialize's on user log in
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  // de-serialize's on each route request
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      if(user){
        //console.log('####### > PASSPORT.DE-SERIALIZE-USER $$$$$$: ', user.id)
      }
      done(err, user);
    });
  });

  // this, then serialize

  passport.use('local', new LocalStrategy({ usernameField: 'email' }, function(username, password, done) {

      User.findOne({ email: username }, function(findOneErr, user) {

        if (findOneErr) { 
          
          return done(findOneErr);

        }else if (!user) {

          return done(null, false, { message: 'No user has that username!' });

        }else{

          user.checkPassword(password, function(checkPassErr, result){

            if (checkPassErr) {
              return done(checkPassErr);
            }

            if(!result){

              return done(null, false, { message: 'Invalid password.' });

            }else{

              return done(null, user);

            }

          });
        }
      });
    }
  ));

};
