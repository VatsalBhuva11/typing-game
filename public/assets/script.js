let time_limit = 30;
const totalTime = time_limit;
let flag = 1;
let textIndex = 0;
let typingText = $('.typingContent').text();
//add stylized letters to this array, join the letters and display. array to add backspace functionality
let newTextArray = [];
//when backspace done, accordingly modify the count of correct letters typed and wrong letters typed
let checkCorrectOrWrong = [];
let correct = 0, wrong = 0, total = 0;

let stopTime;

$(document).keypress(function(event){
    if (flag){
        flag = 0;
        $("#timer").html("00:" + time_limit);
        time_limit -= 1;
        stopTime = setInterval(() => {
            if (time_limit == 0) {
                // $("#timer").html("Time Over");
                let mins = totalTime/60;
                let words = total/5;
                let grossWPM = words/mins;
                let netWPM = grossWPM - wrong/mins;
                netWPM = Math.round(netWPM);
                $("#timer").text("Your speed is "+netWPM+" WPM!");
                clearInterval(stopTime);
            } else {
                if (time_limit < 10) {
                    time_limit = 0 + "" + time_limit;
                }
                
                $("#timer").html("00:" + time_limit);
                
            }
            time_limit -= 1;
        }, 1000);
    }
    // console.log(typingText[startingLetter]);
    let userTypedKey = event.originalEvent.key
    let actualKey = typingText[textIndex];
    let modifiedCharCSS = ""

    if (time_limit >= 0){
        if (userTypedKey === actualKey){
            modifiedCharCSS = "<span class = 'correct'>"+userTypedKey+"</span>";
            newTextArray.push(modifiedCharCSS);
            checkCorrectOrWrong.push("correct");
            correct++;
        }
        else{
            modifiedCharCSS = "<span class = 'wrong'>"+actualKey+"</span>";
            newTextArray.push(modifiedCharCSS);
            checkCorrectOrWrong.push("wrong");
            wrong++;
        }
        total++;
        $('.typingContent').html(newTextArray.join('') + typingText.slice(textIndex+1));
        textIndex++;
    
    }
    // console.log(textIndex%80);
    if (textIndex % 80 === 0){
        $('.container').scrollTop(60);
    }
})

$(document).keyup(function(e){
    //backspace
    if(e.keyCode == 8){
        if (newTextArray.length >= 0){
            newTextArray.pop();
            textIndex--;
            if (checkCorrectOrWrong.pop() === "correct"){
                correct--;
            }
            else{
                wrong--;
            }
            $('.typingContent').html(newTextArray.join('') + typingText.slice(textIndex));
        }

    }
})  


$(".restart").on("click", function(){
    //stop the ongoing timer; start new timer when key pressed again
    clearInterval(stopTime);
    time_limit = 30;
    flag = 1;
    textIndex = 0;
    newTextArray = [];
    correct = 0, wrong = 0, total = 0;
    $('.typingContent').html(typingText);
    $("#timer").text('start typing to start the time');

    
    const { activeElement } = document;
    
    if (activeElement) {
        activeElement.blur();
    }
})



//scroll every 80 letters, right now only once it is scrolling
//add blinking cursor