const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./quotes.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('데이터베이스 연결 성공');
  }
});

// 테이블 생성 (명언 데이터 저장용)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author TEXT NOT NULL
    )
  `);
});

// 명언을 가져와서 저장하는 함수
async function fetchAndStoreQuote() {
  try {
    // 한국어 명언 API 호출 (ZenQuotes API 사용, 한국어 명언 API가 있을 경우 그 API 사용)
    const response = await axios.get('https://zenquotes.io/api/random');
    
    // 예시로 가져온 명언을 한국어 명언으로 처리 (ZenQuotes API는 영어만 지원하지만, 다른 한국어 명언 API를 사용하면 됩니다.)
    const quote = response.data[0].q;  // 명언 텍스트
    const author = response.data[0].a;  // 명언의 저자

    // 한국어 명언을 데이터베이스에 저장
    return new Promise((resolve, reject) => {
      const stmt = db.prepare('INSERT INTO quotes_ko (text, author) VALUES (?, ?)');
      stmt.run(quote, author, function (err) {
        if (err) {
          reject(err);
        } else {
          console.log(`한국어 명언이 성공적으로 저장되었습니다. ID: ${this.lastID}`);
          resolve();
        }
      });
      stmt.finalize();
    });
  } catch (error) {
    throw new Error('명언을 가져오는 중 오류 발생: ' + error.message);
  }
}

// API를 통해 명언을 가져오고 저장하는 라우터
app.get('/save-quote', (req, res) => {
  fetchAndStoreQuote()
    .then(() => res.send('한국어 명언이 성공적으로 저장되었습니다!'))
    .catch((error) => res.status(500).send('명언 저장 오류: ' + error.message));
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
