const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');

// SQLite 데이터베이스 연결 설정
const db = new sqlite3.Database('./quotesDB.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('SQLite 연결 성공');
  }
});

// Express 서버 설정
const app = express();
const port = 3000;

// 데이터베이스 테이블 생성
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote TEXT,
    author TEXT,
    date TEXT
  )`);
});

// 여러 명언 API URL
const apiUrls = [
  'https://zenquotes.io/api/random', // ZenQuotes API
  'https://quotes.rest/qod',         // Quotes API (day of the quote)
  'https://quote-garden.herokuapp.com/api/v3/quotes/random' // Quote Garden API
];

// 여러 명언 API에서 데이터를 가져와 DB에 저장하는 함수
const fetchAndStoreQuotes = async () => {
  try {
    const apiPromises = apiUrls.map(url => axios.get(url).catch(() => null));  // 각 API에 요청 보내기
    const responses = await Promise.all(apiPromises);

    responses.forEach(response => {
      if (response && response.data) {
        let quoteData;
        
        // 각 API의 응답 형태에 맞게 처리
        if (response.data[0]) { // ZenQuotes
          quoteData = response.data[0];
        } else if (response.data.contents) { // Quotes API (day of the quote)
          quoteData = response.data.contents.quotes[0];
        } else if (response.data.data) { // Quote Garden API
          quoteData = response.data.data[0];
        }
        
        if (quoteData) {
          const query = `INSERT INTO quotes (quote, author, date) VALUES (?, ?, ?)`;
          db.run(query, [quoteData.q || quoteData.quote, quoteData.a || quoteData.author, new Date().toISOString()], function (err) {
            if (err) {
              console.error('데이터 저장 오류:', err.message);
            } else {
              console.log('명언 저장 완료, ID:', this.lastID);
            }
          });
        }
      }
    });
  } catch (error) {
    console.error('API 호출 오류:', error);
  }
};

// API로 인용문 저장하기
app.get('/save-quote', (req, res) => {
  fetchAndStoreQuotes()
    .then(() => res.send('Quotes saved successfully!'))
    .catch((error) => res.status(500).send('Error saving quotes.'));
});

// 저장된 인용문 목록 조회 API
app.get('/quotes', (req, res) => {
  const query = 'SELECT * FROM quotes ORDER BY date DESC LIMIT 10'; // 최근 10개의 명언을 가져옵니다.

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('데이터 조회 오류:', err.message);
      res.status(500).send('Error fetching quotes');
    } else {
      res.json(rows);
    }
  });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
