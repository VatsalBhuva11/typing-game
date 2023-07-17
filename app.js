const express = require("express");
const app = express();
const https = require("https");

app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');



let noOfWords = 200;
app.get("/", (req, res) => {
    //make a GET request to words API, and create sentence out of it.
    let sentence = ""
    https.get("https://random-word-api.vercel.app/api?words="+noOfWords, function(response){
        response.on('data', (data) => {
            var formattedData = JSON.parse(data);
            for (let i = 0; i<noOfWords; i++){
                sentence += formattedData[i]+" ";
            }
            res.render("index", {typingContent: sentence, noOfWords: noOfWords});
        });
    })
})

app.get("/result", function(req, res){
    res.render("result", {wpm: wpm});
})




app.listen(process.env.PORT || 3000, function(){
    console.log("Listening on port "+process.env.PORT+"...");
})
