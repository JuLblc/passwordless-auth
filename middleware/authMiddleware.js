const jwt = require('jsonwebtoken');
const SECRET_TOKEN = process.env.SECRET_TOKEN;
const User = require('../models/User.model');

const requireAuth = (req, res ,next) => {

  const token = req.cookies.jwt;

  if (token){
    jwt.verify(token, SECRET_TOKEN, (err, decodedToken) => {
      if (err){
        console.log(err)
        res.redirect('/');
      } else {
        next();
      }
    })
  } else {
    res.redirect('/');
  }
}

const checkUser = (req, res , next) => {

  const token = req.cookies.jwt;

  if (token){
    jwt.verify(token, SECRET_TOKEN, (err, decodedToken) => {
      if (err){
        console.log(err)
        res.locals.user = null;
        next();
      } else {
        User.findById(decodedToken.id)
          .then(foundUser => {
            res.locals.user = foundUser
            next();
          })
          .catch(error => next(error));       
      }
    })
  } else {
    res.locals.user = null;
    next();
  }
}

module.exports = {requireAuth,checkUser};