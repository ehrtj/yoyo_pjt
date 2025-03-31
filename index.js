const longText = `밑줄 긋기의 효과를 얻기 위한 방법에는 몇 가지가 있다. 우선 글을 읽는 중에는 문장이나 문단에 나타난 정보 간의 상대적  중요도를 결정할 때까지 밑줄 긋기를 잠시 늦추었다가 주요한  정보에 밑줄 긋기를 한다. 이때 주요한 정보는 독서 목적에 따라 달라질 수 있다는 점을 고려한다. 또한 자신만의 밑줄 긋기 표시 체계를 세워 밑줄 이외에 다른 기호도 사용할 수 있다. 밑줄  긋기 표시 체계는 밑줄 긋기가 필요한 부분에 특정 기호를  사용하여 표시하기로 독자가 미리 정해 놓는 것이다. 예를 들면 하나의 기준으로 묶을 수 있는 정보들에 동일한 기호를 붙이거나 순차적인 번호를 붙이기로 하는 것 등이다. 이는 기본적인 밑줄 긋기를 확장한 방식이라 할 수 있다.  `;

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
    textDisplay.textContent = currentText; // 제시된 긴 글을 그대로 표시
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
    let displayText = '';

    // 사용자가 입력한 텍스트와 제시된 텍스트를 비교하여 오타 표시
    for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] === currentText[i]) {
            displayText += `<span class="correct">${typedText[i]}</span>`; // 올바른 글자는 검정색으로 표시
        } else {
            displayText += `<span class="incorrect">${typedText[i]}</span>`; // 오타는 빨간색으로 표시
        }
    }

    // 타이핑한 글자만 빨간색으로 표시하고, 입력창 내에서만 보이도록 함
    typingInput.style.color = "black"; // 타이핑박스의 기본 텍스트 색상은 검정색

    // 타이핑이 완료되면 게임 종료
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
