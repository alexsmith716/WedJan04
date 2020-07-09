
module.exports.ensureAuthenticated = function(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/loginorsignup');
  }
};


module.exports.ensureNotAuthenticated = function(req, res, next){
  if (!req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/');
  }
};