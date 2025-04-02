document.addEventListener("DOMContentLoaded", function () {
    let startBtn = document.getElementById("startBtn");
    let englishBtn = document.getElementById("get-en-quote");
    let koreanBtn = document.getElementById("get-ko-quote");
    let textDisplay = document.getElementById("quote-container");
    let typingInput = document.getElementById("typing-input");
    let result = document.getElementById("result");
    let timerDisplay = document.getElementById("timer");
    let rankingDisplay = document.getElementById("ranking-container");
    let saveRankingBtn = document.createElement("button");

    let currentText = '';
    let startTime = null;
    let timerInterval;
    let timeLeft = 300;
    let selectedLanguage = '';
    
    let lastGameTime = 0;
    let lastGameCPM = 0;

    saveRankingBtn.textContent = "🏆 랭킹 등록하기";
    saveRankingBtn.style.display = "none";
    saveRankingBtn.style.marginTop = "10px";
    saveRankingBtn.style.padding = "10px 20px";
    saveRankingBtn.style.fontSize = "16px";
    saveRankingBtn.style.cursor = "pointer";
    document.body.appendChild(saveRankingBtn);

    englishBtn.addEventListener("click", () => selectLanguage("en"));
    koreanBtn.addEventListener("click", () => selectLanguage("ko"));
    startBtn.addEventListener("click", startGame);
    saveRankingBtn.addEventListener("click", () => saveRanking(lastGameTime, lastGameCPM));

    function selectLanguage(language) {
        selectedLanguage = language;
        startBtn.style.display = "block";
        englishBtn.style.display = "none";
        koreanBtn.style.display = "none";
        fetchRandomQuote(selectedLanguage);
        loadRankings(selectedLanguage);  // 🏆 언어 선택 시 랭킹도 불러오기!
    }

    async function fetchRandomQuote(language) {
        const endpoint = language === 'ko' ? '/random-quote-ko' : '/random-quote-en';
        try {
            const response = await fetch(`http://127.0.0.1:3000${endpoint}`);
            if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);

            const data = await response.json();
            if (data && data.quote) {
                currentText = data.quote;
                textDisplay.innerHTML = currentText
                    .split('')
                    .map(char => `<span>${char}</span>`)
                    .join('');

                typingInput.value = '';
                typingInput.disabled = false;
                typingInput.style.display = "inline-block";
                typingInput.focus();
            } else {
                textDisplay.textContent = '명언을 가져오는 데 실패했습니다.';
            }
        } catch (error) {
            console.error('❌ fetch 오류:', error);
            textDisplay.textContent = `명언을 가져오는 데 실패했습니다. 오류: ${error.message}`;
        }
    }

    function startGame() {
        startTime = new Date().getTime();
        console.log("🚀 게임 시작:", startTime);

        typingInput.style.display = "block";
        textDisplay.style.display = "block";
        typingInput.value = '';
        typingInput.disabled = false;
        result.textContent = '';
        timerDisplay.style.display = "block";
        saveRankingBtn.style.display = "none";

        startBtn.style.display = "none";
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
        if (!startTime) {
            startTime = new Date().getTime();
            console.warn("⚠️ startTime 자동 설정:", startTime);
        }

        let typedText = typingInput.value;
        let textSpans = textDisplay.querySelectorAll("span");

        let correct = true;
        textSpans.forEach((span, index) => {
            if (index < typedText.length) {
                if (typedText[index] === span.textContent) {
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
            endGame();
        }
    });

    function endGame() {
        let endTime = new Date().getTime();
        console.log("🏁 게임 종료:", endTime);

        let timeTaken = (endTime - startTime) / 1000;
        let cpm = (currentText.length / timeTaken) * 60;

        lastGameTime = timeTaken;
        lastGameCPM = cpm;

        console.log(`⌛ 소요 시간: ${timeTaken.toFixed(2)}초`);
        console.log(`⚡ CPM: ${cpm.toFixed(2)}`);

        result.textContent = `🎉 완료! 소요 시간: ${timeTaken.toFixed(2)}초, 타수: ${cpm.toFixed(2)}`;
        
        typingInput.disabled = true;
        clearInterval(timerInterval);

        saveRankingBtn.style.display = "block"; 
    }

    async function saveRanking(time, cpm) {
        let playerName = prompt("이름을 입력하세요:");
        if (!playerName) return;

        try {
            const response = await fetch('http://127.0.0.1:3000/save-ranking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: playerName, 
                    time: time.toFixed(2), 
                    cpm: cpm.toFixed(2), 
                    language: selectedLanguage 
                })
            });

            if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);

            console.log('✅ 랭킹 저장 성공');
            loadRankings(selectedLanguage);
        } catch (error) {
            console.error("❌ 랭킹 저장 실패:", error);
        }
    }

    async function loadRankings(language) {
        try {
            const response = await fetch(`http://localhost:3000/get-rankings/${language}`);
            if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
            
            const data = await response.json();
            console.log("✅ 랭킹 데이터:", data);

            rankingDisplay.innerHTML = '<h2>🏆 랭킹</h2>'; // 기존 내용 초기화

            if (data.length === 0) {
                rankingDisplay.innerHTML += '<p>랭킹 데이터가 없습니다.</p>';
                return;
            }

            const list = document.createElement('ul');
            data.forEach((rank, index) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${index + 1}위: ${rank.name} - ⏱ ${rank.time}초 (CPM: ${rank.cpm})`;
                list.appendChild(listItem);
            });

            rankingDisplay.appendChild(list);
        } catch (error) {
            console.error("❌ 랭킹 불러오기 실패:", error);
        }
    }

    loadRankings("en"); 
    loadRankings("ko"); 
});
