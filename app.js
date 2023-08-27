require("dotenv").config()
const express = require("express");
const app = express();
const https = require("https");
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const mongoose = require("mongoose");

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const oauth2Client = new OAuth2(
    process.env.CLIENT_ID, // ClientID
    process.env.CLIENT_SECRET, // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
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
        user: 'vatsalbhuva11@gmail.com',
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken
    }
});

let noOfWords = 200;
let sentence = ""

// https.get("https://random-word-api.vercel.app/api?words="+noOfWords, function(response){
//     response.on('data', (data) => {
//         var formattedData = JSON.parse(data);
//         for (let i = 0; i<noOfWords; i++){
//             sentence += formattedData[i]+" ";
//         }
//     });
// })


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
        var mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Email verification',
            text: 'That was easy!'
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                res.render("reg-or-log", {message: "Could not send email for verification."})
            } else {
                console.log('Email sent: ' + info.response);
                res.render("reg-or-log", {message: "Successfully sent email for verification."})
            }
          });
    }
})

// app.post("/restart", (req, res)=>{
//     sentence = ""
//     https.get("https://random-word-api.vercel.app/api?words="+noOfWords, function(response){
//         response.on('data', (data) => {
//             var formattedData = JSON.parse(data);
//             for (let i = 0; i<noOfWords; i++){
//                 sentence += formattedData[i]+" ";
//             }
//         });
//         res.redirect("/")
//     })
// })

app.listen(3000, function(){
    console.log("Listening on port "+process.env.PORT+"...");
})
