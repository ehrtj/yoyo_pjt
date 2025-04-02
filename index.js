document.addEventListener("DOMContentLoaded", function () {
    let startBtn = document.getElementById("startBtn");
    let englishBtn = document.getElementById("get-en-quote");
    let koreanBtn = document.getElementById("get-ko-quote");
    let textDisplay = document.getElementById("quote-container");
    let typingInput = document.getElementById("typing-input");
    let result = document.getElementById("result");
    let timerDisplay = document.getElementById("timer");

    let currentText = '';
    let startTime, endTime;
    let timerInterval;
    let timeLeft = 300; // 5분
    let selectedLanguage = '';

    // 언어 선택 버튼 이벤트 리스너
    englishBtn.addEventListener("click", () => selectLanguage('en'));
    koreanBtn.addEventListener("click", () => selectLanguage('ko'));
    startBtn.addEventListener("click", startGame);

    function selectLanguage(language) {
        selectedLanguage = language;
        startBtn.style.display = "block"; // 게임 시작 버튼 보이기
        englishBtn.style.display = "none"; // 영어 선택 버튼 숨기기
        koreanBtn.style.display = "none"; // 한국어 선택 버튼 숨기기
        fetchRandomQuote();
    }

    async function fetchRandomQuote() {
        try {
            const url = selectedLanguage === 'en' 
                ? 'http://127.0.0.1:3000/random-quote-en' 
                : 'http://127.0.0.1:3000/random-quote-ko';

            console.log('Fetching quote from:', url);
            const response = await fetch(url);
            console.log('Response status:', response.status);

            if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);

            const data = await response.json();
            console.log('Fetched quote:', data);

            if (data && data.quote) {
                currentText = data.quote;
                textDisplay.innerHTML = currentText
                    .split('')
                    .map(char => `<span>${char}</span>`)
                    .join('');
                
                typingInput.value = '';
                typingInput.disabled = false;
                typingInput.style.display = "inline-block"; // 타이핑 창 보이기
                typingInput.focus();
            } else {
                textDisplay.textContent = '명언을 가져오는 데 실패했습니다.';
            }
        } catch (error) {
            console.error('fetch 오류:', error);
            textDisplay.textContent = `명언을 가져오는 데 실패했습니다. 오류: ${error.message}`;
        }
    }

    function startGame() {
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

    function startTimer() {
        timeLeft = 300;
        timerInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                result.textContent = "⏳ 타자 연습 종료! 시간을 초과했습니다.";
                typingInput.disabled = true;
                resetGameUI();
            } else {
                timeLeft--;
                let minutes = Math.floor(timeLeft / 60);
                let seconds = timeLeft % 60;
                timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            }
        }, 1000);
    }

    typingInput.addEventListener("input", () => {
        let typedText = typingInput.value;
        let textSpans = textDisplay.querySelectorAll("span");

        let correct = true;
        textSpans.forEach((span, index) => {
            if (index < typedText.length) {
                if (typedText[index] === currentText[index]) {
                    span.style.color = "green";
                } else {
                    span.style.color = "red";
                    correct = false;
                }
            } else {
                span.style.color = "black"; 
            }
        });

        if (typedText === currentText) {
            endTime = new Date().getTime();
            let timeTaken = (endTime - startTime) / 1000;
            let cpm = (typedText.length / timeTaken) * 60;

            result.textContent = `🎉 완료! 소요 시간: ${timeTaken.toFixed(2)}초, 1분당 평균 글자 수: ${cpm.toFixed(2)}`;
            typingInput.disabled = true;
            clearInterval(timerInterval);
            resetGameUI();
        }
    });

    function resetGameUI() {
        startBtn.style.display = "none";
        englishBtn.style.display = "block"; 
        koreanBtn.style.display = "block";
    }
});
