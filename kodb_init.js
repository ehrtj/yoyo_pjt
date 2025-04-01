const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// SQLite 데이터베이스 연결 (quotesDB.db 사용)
const db = new sqlite3.Database('./quotesDB.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('데이터베이스 연결 성공');
  }
});

// quotes_ko 테이블 생성 (한국어 명언 데이터 저장용)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS quotes_ko (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      author TEXT NOT NULL
    )
  `);
});

// 명언을 가져오고 저장하는 함수 (20번 반복해서 명언 저장)
async function fetchAndStoreQuotes() {
  try {
    // 한 번에 20개의 명언을 저장
    for (let i = 0; i < 20; i++) {
      // 한국어 명언 API 호출
      const response = await axios.get('https://korean-advice-open-api.vercel.app/api/advice');
      const quote = response.data.message;  // 명언 텍스트
      const author = response.data.author || "Unknown";  // 저자 (없으면 "Unknown"으로 처리)

      // 명언을 데이터베이스에 저장
      return new Promise((resolve, reject) => {
        const stmt = db.prepare('INSERT INTO quotes_ko (text, author) VALUES (?, ?)');
        stmt.run(quote, author, function (err) {
          if (err) {
            reject(err);
          } else {
            console.log(`명언이 성공적으로 저장되었습니다. ID: ${this.lastID}`);
            resolve();
          }
        });
        stmt.finalize();
      });
    }
  } catch (error) {
    throw new Error('명언을 가져오는 중 오류 발생: ' + error.message);
  }
}

// 서버에서 20개의 한국어 명언을 저장하는 라우터
app.get('/save-20-quotes', (req, res) => {
  fetchAndStoreQuotes()
    .then(() => res.send('20 quotes saved successfully!'))
    .catch((error) => res.status(500).send('Error saving quotes: ' + error.message));
});

// 명언을 삭제하는 함수 (모든 명언 삭제)
app.get('/delete-all-quotes', (req, res) => {
  db.run('DELETE FROM quotes_ko', function (err) {
    if (err) {
      res.status(500).send('Error deleting quotes: ' + err.message);
    } else {
      res.send('All quotes deleted successfully!');
    }
  });
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
