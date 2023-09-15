require("dotenv").config()
const express = require("express");
const app = express();
const https = require("https");
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const session = require("express-session");
const { google } = require("googleapis");

const passport = require("passport");
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const OAuth2 = google.auth.OAuth2;
const PORT = 3000;
//if PORT change, change REDIRECT URI in GOOGLE CONSOLE AS WELL.

const mongoose = require("mongoose");

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
// app.use(express.json());
app.set('view engine', 'ejs');

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
        done(null, user);
});

passport.use(new GoogleStrategy({
    clientID:     process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    ///auth/google/sign-in called when google
    callbackURL: `http://localhost:${PORT}/oauth/google/sign-in`,
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
const oauth2Client = new OAuth2(
    process.env.CLIENT_ID, // ClientID
    process.env.CLIENT_SECRET, // Client Secret
    process.env.REDIRECT_URI // Redirect URL
);
oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
});
const accessToken = oauth2Client.getAccessToken()


const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USERNAME,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken
    }
});

app.use(session({ 
    secret: process.env.GAUTH_SECRET_KEY,
    resave: true,
    saveUninitialized: true
  }));

app.use(passport.initialize());
app.use(passport.session());

let noOfWords = 200;
let sentence = ""
let register_timer = 10;
const saltRounds = 10;
let email_token;

https.get("https://random-word-api.vercel.app/api?words="+noOfWords, function(response){
    response.on('data', (data) => {
        var formattedData = JSON.parse(data);
        for (let i = 0; i<noOfWords; i++){
            sentence += formattedData[i]+" ";
        }
    });
})


app.get("/", (req, res) => {
    //make a GET request to words API, and create sentence out of it.
    res.render("index", {typingContent: sentence, noOfWords: noOfWords, initialTime: 30});
})

app.get("/options/:time", function(req, res){
    let time = req.params.time;
    res.render("index", {typingContent: sentence, noOfWords: noOfWords, initialTime: Number(time)});
})

app.get("/register-login", function(req, res){
    res.render("reg-or-log", {message: ""});
})

app.post("/register", function(req, res){
    const {username, email, email_verify, password, password_verify} = req.body;
    if (email_verify !== email){
        res.status(400).render("reg-or-log",{ message: "Emails do not match!" });
    } else if(password_verify !== password){
        res.status(400).render("reg-or-log",{ message: "Passwords do not match!" });
    } else {
        email_token = jwt.sign({ 
            exp: Math.floor(Date.now() / 1000) + 10, //60 seconds expiry
            email: email 
        }, process.env.JWT_SECRET_KEY);
    
        bcrypt.hash(password, saltRounds, function(err, hash) {
            if (err){
                res.send("Error occurred.\n"+err);
            } else {
                let mailOptions = {
                    from: process.env.EMAIL_USERNAME,
                    to: email,
                    subject: 'Email verification',
                    text: 'Verify your email!',
                    html: `<h1>Click the link below to verify your account!</h1></hr><form method="POST" action="http://localhost:${PORT}/user/verify-token"><input type="hidden" name="username" value="${username}"><input type="hidden" name="email" value="${email}"><input type="hidden" name="password" value="${hash}"><button type="submit" class="btn-link">Verify Account</button></form>`
                  };
                  transporter.sendMail(mailOptions, function(error, info){
                      if (error) {
                          console.log(error);
                          res.render("reg-or-log", {message: "Could not send email for verification."})
                      } else {
                          console.log('Email sent: ' + info.response);
                          res.render("reg-or-log", {message: "Successfully sent email for verification. Verify within 60s."})
                      }
                  });
            }
        });

        // while (register_timer > 0){
        //     setTimeout(function(){
        //         console.log(register_timer);
        //         register_timer--;
        //     }, 1000);
        // }
    }
})

app.post("/user/verify-token", (req, res)=>{
    if (register_timer <= 0){
        register_timer = 10;
        res.render("verification", {message: "Session expired. Register again."});
    } else {
        const {username, email, password} = req.body;
        console.log(username);
        console.log(email);
        console.log(password);
        jwt.verify(email_token, process.env.JWT_SECRET_KEY, function(err, decoded) {
            if (err) res.send(err);
            else{
                const decoded_email = decoded.email;
                if (decoded_email === email){
                    res.render("verification", {message: "Successfully verified! You can now log in."});
                } else {
                    res.render("verification", {message: "Error occurred while verifying. Try registering again."});
                }
            }
        });
        // res.send("Hi");
    }
})

app.get("/google/failed", (req, res) => {
    res.render("verification", {message: "Error while logging in through Google."})
})
app.get("/google/success", (req, res) => {
    res.render("verification", {message: "Successfully logged in through Google!"})
})

app.get('/oauth/google',
    passport.authenticate('google', {
            scope:
                ['email', 'profile']
        }
    ));

app.get('/oauth/google/sign-in',
    passport.authenticate('google', {
        failureRedirect: '/',
    }),
    function (req, res) {
        res.redirect('/success')
    }
);




app.post("/restart", (req, res)=>{
    sentence = ""
    https.get("https://random-word-api.vercel.app/api?words="+noOfWords, function(response){
        response.on('data', (data) => {
            var formattedData = JSON.parse(data);
            for (let i = 0; i<noOfWords; i++){
                sentence += formattedData[i]+" ";
            }
        });
        res.redirect("/")
    })
})

app.listen(PORT, function(){
    console.log("Listening on port "+process.env.PORT+"...");
})
