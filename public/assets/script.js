let time_limit = Number($('#initialTime').text());
$('#'+time_limit).css("color", "orange");

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
        if (totalTime > 60){
            let newTime = time_limit - 60;
            if (newTime < 10) {
                $("#timer").html("01:0" + time_limit);
            }
            else{
                $("#timer").html("01:" + newTime);
            }
        }
        else{
            $("#timer").html("00:" + time_limit);
        }
        time_limit -= 1;
        stopTime = setInterval(() => {
            if (time_limit == 0) {
                let mins = totalTime/60;
                let words = total/5;
                let correctWPM = (correct/5)/mins;
                let grossWPM = words/mins;
                let netWPM = grossWPM - wrong/mins;
                netWPM = Math.round(netWPM);
                let accuracy = Math.round(correct/total*100);
                $("#timer").text("Speed: "+netWPM+" WPM, Accuracy: "+accuracy+"%");
                clearInterval(stopTime);    
            } else {
                if (time_limit < 10) {
                    $("#timer").html("00:0" + time_limit);
                }
                else{
                    if (time_limit > 60){
                        let newTime = time_limit - 60;
                        $("#timer").html("01:" + newTime);
                    }
                    else{
                        $("#timer").html("00:" + time_limit);
                    }
                }            
            }
            time_limit -= 1;
        }, 1000);
}
// console.log(typingText[startingLetter]);
let userTypedKey = event.originalEvent.key
let actualKey = typingText[textIndex];
    let modifiedCharCSS = ""

    if (time_limit >= 0){
        if (newTextArray.length >= 1){
            let last = $('.typingContent > span').slice(-1)[0];
            last.classList.remove("caret");
            newTextArray.pop();
            newTextArray.push(last.outerHTML);
        }
        if (userTypedKey === actualKey){
            modifiedCharCSS = "<span class = 'caret correct'>"+userTypedKey+"</span>";
            newTextArray.push(modifiedCharCSS);
            checkCorrectOrWrong.push("correct");
            correct++;
        }
        else{
            modifiedCharCSS = "<span class = 'caret wrong'>"+actualKey+"</span>";
            newTextArray.push(modifiedCharCSS);
            checkCorrectOrWrong.push("wrong");
            wrong++;
        }
        total++;
        $('.typingContent').html(newTextArray.join('') + typingText.slice(textIndex+1));
        textIndex++;
    }

    console.log(textIndex % 80);
    if (textIndex % 80 === 0){
        $('.container').scrollTop(60 * (textIndex/80));
    }
})

$(document).keyup(function(e){
    //backspace
    if(e.keyCode == 8){
        if (newTextArray.length >= 0){
            newTextArray.pop();
            textIndex--;
            if (newTextArray.length >= 1){
                let last = $('.typingContent > span').slice(-2)[0];
                last.classList.add("caret");
                newTextArray.pop();
                newTextArray.push(last.outerHTML);
            }
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
    time_limit = totalTime;
    flag = 1;
    textIndex = 0;
    newTextArray = [];
    checkCorrectOrWrong = [];
    correct = 0, wrong = 0, total = 0;
    $('.container').animate({ scrollTop: 0 }, "fast");
    $('.typingContent').html(typingText);
    $("#timer").text('start typing to start the timer');
        
    const { activeElement } = document;
    
    if (activeElement) {
        activeElement.blur();
    }
})

$(".retry").on("click", function(){
    //stop the ongoing timer; start new timer when key pressed again
    clearInterval(stopTime);
    time_limit = totalTime;
    flag = 1;
    textIndex = 0;
    newTextArray = [];
    checkCorrectOrWrong = [];
    correct = 0, wrong = 0, total = 0;
    $('.container').animate({ scrollTop: 0 }, "fast");
    $('.typingContent').html(typingText);
    $("#timer").text('start typing to start the timer');
        
    const { activeElement } = document;
    
    if (activeElement) {
        activeElement.blur();
    }
})

// 

