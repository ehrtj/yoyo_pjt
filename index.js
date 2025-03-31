const longText = `요요요`;

let startBtn = document.getElementById("startBtn");
let textDisplay = document.getElementById("textDisplay");
let typingInput = document.getElementById("typingInput");
let result = document.getElementById("result");
let timerDisplay = document.getElementById("timer");

let currentText = '';
let startTime, endTime;
let timerInterval;
let timeLeft = 300; // 5분 (300초)

startBtn.addEventListener("click", startGame);
typingInput.addEventListener("input", checkTyping);

function startGame() {
    typingInput.style.display = "block"; // 게임 시작 시 타이핑 입력창 보이기
    textDisplay.style.display = "block"; // 게임 시작 시 긴 글 박스 보이기
    typingInput.value = '';
    typingInput.disabled = false;
    result.textContent = '';
    timerDisplay.style.display = "block"; // 타이머 보이기
    currentText = longText;
    textDisplay.textContent = currentText;
    startTime = new Date().getTime();
    startBtn.style.display = "none"; // 게임 시작 버튼 숨기기
    startTimer();
    typingInput.focus();
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            result.textContent = "타자 연습 종료! 시간을 초과했습니다.";
            typingInput.disabled = true;
            startBtn.style.display = "block"; // 버튼 다시 보이기
        } else {
            timeLeft--;
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }
    }, 1000);
}

function checkTyping() {
    let typedText = typingInput.value;
    
    if (typedText === currentText) {
        endTime = new Date().getTime();
        let timeTaken = (endTime - startTime) / 1000; // 소요 시간(초)
        let charactersTyped = typedText.length; // 타이핑한 글자 수
        let cpm = (charactersTyped / timeTaken) * 60; // 1분당 평균 글자 수 (CPM)

        result.textContent = `완료! 소요 시간: ${timeTaken.toFixed(2)}초, 1분당 평균 글자 수: ${cpm.toFixed(2)}`;
        typingInput.disabled = true;
        clearInterval(timerInterval); // 타이머 멈추기
        startBtn.style.display = "block"; // 버튼 다시 보이기
    }
}
