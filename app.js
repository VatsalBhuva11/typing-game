require("dotenv").config
const express = require("express");
const app = express();
const https = require("https");
const mongoose = require("mongoose");

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');

let noOfWords = 200;
let sentence = ""

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
    res.render("reg-or-log");
})

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

app.listen(3000, function(){
    console.log("Listening on port "+process.env.PORT+"...");
})
