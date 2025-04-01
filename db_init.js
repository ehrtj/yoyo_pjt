const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const https = require('https'); // https 모듈을 가져옴

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

// Quotable API URL (한 개의 랜덤 명언을 받아옵니다)
const apiUrl = 'https://api.quotable.io/random';

// SSL 인증서 검증을 비활성화한 axios 인스턴스 생성
const agent = new https.Agent({  
  rejectUnauthorized: false  // SSL 인증서 검증을 하지 않도록 설정
});

const axiosInstance = axios.create({
  httpsAgent: agent
});

// 한 번에 20개의 명언을 가져오는 함수
const fetchAndStoreQuotes = async () => {
  try {
    for (let i = 0; i < 20; i++) {
      // API 요청을 한 번씩 보내서 명언을 받아옵니다.
      const response = await axiosInstance.get(apiUrl); // SSL 인증서 검증을 비활성화한 axios 인스턴스를 사용
      const quoteData = response.data; // 반환된 명언 데이터

      // SQLite에 저장
      const query = `INSERT INTO quotes (quote, author, date) VALUES (?, ?, ?)`;
      db.run(query, [quoteData.content, quoteData.author, new Date().toISOString()], function (err) {
        if (err) {
          console.error('데이터 저장 오류:', err.message);
        } else {
          console.log(`명언 저장 완료, ID: ${this.lastID}`);
        }
      });
    }
  } catch (error) {
    console.error('API 호출 오류:', error);
  }
};

// API로 여러 개의 명언을 저장하는 엔드포인트
app.get('/save-quotes', (req, res) => {
  fetchAndStoreQuotes()
    .then(() => res.send('20개의 명언이 성공적으로 저장되었습니다!'))
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
