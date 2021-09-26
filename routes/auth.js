const express = require('express');
const router = express.Router();
const transporter = require('../configs/mailer')
const jwt = require('jsonwebtoken')
const SECRET_TOKEN = process.env.SECRET_TOKEN
const User = require('../models/User.model');

// Fonction utilitaire
function sendToken(email, id) {
  const token = jwt.sign({
    "iss": "magiclink",
    "exp": Math.floor(Date.now() / 1000) + (60 * 5), //Token expires in 5 minutes
    "sub": id,
    "nonce": Math.random().toString(36).substring(2, 15)
  }, SECRET_TOKEN);

  const option = {
    from: process.env.EMAIL_ADRESS,
    to: email,
    subject: `Your magic link`,
    html: `
              Hello,</br>
              Click on this link to log in</br>
              <a href=${process.env.NOM_DOMAINE}/authenticate?token=${token}> Log in </a></br>
              Merci`
  }

  transporter.sendMail(option, (err) => {
    if (err) {
      console.log('Error Sending Email')
    } else {
      console.log('Mail sent successfully')
    }
  })
}

router.post("/login", (req, res) => {

  const email = req.body.email;

  if (!email) {
    res.status(403);
    res.send({
      message: "There is no email address that matches this.",
    });
    return;
  }

  if (email) {
    // Check si Email Adress dans base
    User.findOne({ email })
      .then(foundUser => {
        // => Si non, créer nouveau user
        if (!foundUser) {
          const newUser = new User({
            email: email,
            lastConnection: new Date()
          })

          newUser.save()
            .then(() => {
              sendToken(email, newUser._id)
              res.status(200);
              res.render('token-sent',{ message: 'Un E-mail pour valider votre adresse vous a été envoyé.' });
            })
            .catch(error => next(error));
          // => Si oui, recupérer iD
        } else {
          sendToken(email, foundUser._id)
          res.render('token-sent',{ message: 'Un E-mail pour vous connecter vous a été envoyé.' });
        }
      })
      .catch(error => next(error));
  }
});

router.get("/authenticate", (req, res) => {

  const token = req.query.token;

  if (!token) {
    res.status(403);
    res.send({
      message: "There is no token.",
    });
    return;
  }

  if (token) {
    try {
      const decodedToken = jwt.verify(token, SECRET_TOKEN)
      const _id = decodedToken.sub

      User.findOne({ _id })
        .then(foundUser => {
          req.session.currentUser = foundUser
          res.render('index',{user:req.session.currentUser})
        })
        .catch(error => next(error));
    }
    catch (err) {
      res.send({
        message: err.message,
      });
    }
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;