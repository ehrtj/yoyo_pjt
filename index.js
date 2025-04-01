let startBtn = document.getElementById("startBtn");
let englishBtn = document.getElementById("englishBtn");
let koreanBtn = document.getElementById("koreanBtn");
let textDisplay = document.getElementById("textDisplay");
let typingInput = document.getElementById("typingInput");
let result = document.getElementById("result");
let timerDisplay = document.getElementById("timer");

startBtn.addEventListener("click", startGame);
englishBtn.addEventListener("click", () => selectLanguage('en')); // 영어 명언 선택
koreanBtn.addEventListener("click", () => selectLanguage('ko')); // 한국어 명언 선택

let currentText = '';
let startTime, endTime;
let timerInterval;
let timeLeft = 300; // 5분 (300초)
let selectedLanguage = ''; // 선택된 언어

// 언어 선택 함수
function selectLanguage(language) {
    selectedLanguage = language;
    startBtn.style.display = "block"; // 게임 시작 버튼 보이기
    englishBtn.style.display = "none"; // 영어 선택 버튼 숨기기
    koreanBtn.style.display = "none"; // 한국어 선택 버튼 숨기기

    // 명언을 가져와서 화면에 표시
    fetchRandomQuote(); // 언어에 맞는 명언을 가져옵니다.
}

// 랜덤 명언 가져오는 함수
async function fetchRandomQuote() {
    try {
        const url = selectedLanguage === 'en' ? 'http://127.0.0.1:3000/random-quote-en' : 'http://127.0.0.1:3000/random-quote-ko';
        console.log('Fetching quote from:', url);  // 호출되는 URL을 콘솔에 출력
        
        const response = await fetch(url); // 선택한 언어의 API 호출
        console.log('Response status:', response.status); // 응답 상태 코드 출력
        
        if (!response.ok) {
            throw new Error('명언을 가져오는 데 실패했습니다.');
        }
        const data = await response.json();
        console.log('Fetched quote:', data);  // 명언 데이터 출력
        currentText = data.quote;  // 명언을 가져와 currentText에 저장
        textDisplay.textContent = currentText; // 명언을 화면에 표시
    } catch (error) {
        console.error('fetch 오류:', error.message);  // 오류 메시지 출력
        textDisplay.textContent = '명언을 가져오는 데 실패했습니다.'; // 실패한 경우 메시지 출력
    }
}

// 게임 시작 함수
async function startGame() {
    typingInput.style.display = "block";
    textDisplay.style.display = "block";
    typingInput.value = '';
    typingInput.disabled = false;
    result.textContent = '';
    timerDisplay.style.display = "block";
    
    startTime = new Date().getTime();
    startBtn.style.display = "none"; // 게임 시작 후 버튼 숨기기
    startTimer();
    typingInput.focus();
}

// 타이머 시작 함수
function startTimer() {
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            result.textContent = "타자 연습 종료! 시간을 초과했습니다.";
            typingInput.disabled = true;
            englishBtn.style.display = "block"; // 게임 종료 후 버튼 다시 보이기
            koreanBtn.style.display = "block"; // 게임 종료 후 버튼 다시 보이기
        } else {
            timeLeft--;
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
        }
    }, 1000);
}

// 타이핑 확인 함수
function checkTyping() {
    let typedText = typingInput.value;
    let displayText = '';

    for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] === currentText[i]) {
            displayText += `<span class="correct">${typedText[i]}</span>`;
        } else {
            displayText += `<span class="incorrect">${typedText[i]}</span>`;
        }
    }

    textDisplay.innerHTML = displayText; // 실시간 타이핑 결과 업데이트

    if (typedText === currentText) {
        endTime = new Date().getTime();
        let timeTaken = (endTime - startTime) / 1000;
        let charactersTyped = typedText.length;
        let cpm = (charactersTyped / timeTaken) * 60;

        result.textContent = `완료! 소요 시간: ${timeTaken.toFixed(2)}초, 1분당 평균 글자 수: ${cpm.toFixed(2)}`;
        typingInput.disabled = true;
        clearInterval(timerInterval);
        englishBtn.style.display = "block"; // 게임 종료 후 버튼 다시 보이기
        koreanBtn.style.display = "block"; // 게임 종료 후 버튼 다시 보이기
    }
}

fetch('http://127.0.0.1:3000/random-quote-en', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors' // 이 줄은 사실 기본 설정이지만, 명시적으로 추가할 수 있습니다.
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => {
      console.error('fetch 오류:', error);
    });
  