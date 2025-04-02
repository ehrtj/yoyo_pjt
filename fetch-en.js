// fetch-en.js

fetch('http://localhost:3000/random-quote-en', {  // localhost 사용
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors'
})

    .then(response => response.json())
    .then(data => {
      if (data && data.quote) {
        console.log('영어 명언:', data.quote);
        // 예시로, 명언을 페이지에 표시
        document.getElementById('quote-container').innerText = data.quote;
      } else {
        console.error('영어 명언을 가져오는 데 실패했습니다.');
      }
    })
    .catch(error => {
      console.error('fetch 오류:', error);
    });
  