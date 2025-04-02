const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();

const cors = require('cors'); // CORS 미들웨어 추가
// CORS 설정 (모든 도메인에서 API 호출 허용)
app.use(cors());

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./quotesDB.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('SQLite 연결 성공');
  }
});

// HTML 파일 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// /random-quote-en API - 영어 명언 가져오기
app.get('/random-quote-en', (req, res) => {
  const query = 'SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1'; // 영어 명언 랜덤 선택
  console.log('Executing query:', query);

  db.get(query, [], (err, row) => {
    if (err) {
      console.error('데이터 조회 오류:', err.message);
      res.status(500).json({ error: '명언을 가져오는 데 실패했습니다.' });
    } else {
      if (row) {
        console.log('Fetched quote:', row);
        res.json({ quote: row.quote }); // JSON 형식으로 반환
      } else {
        res.status(404).json({ error: '명언을 찾을 수 없습니다.' });
      }
    }
  });
});

// 한국어 명언 가져오기
app.get('/random-quote-ko', (req, res) => {
  const query = 'SELECT * FROM quotes_ko ORDER BY RANDOM() LIMIT 1'; 
  console.log('Executing query for Korean quote:', query);

  db.get(query, [], (err, row) => {
    if (err) {
      console.error('데이터 조회 오류:', err.message);
      res.status(500).json({ error: '한국어 명언을 가져오는 데 실패했습니다.' });
    } else {
      console.log('Fetched Korean quote:', row);  // ✅ row 값 확인!
      if (row) {
        res.json({ quote: row.text });  // 🔥 "row.quote" → "row.text" 수정!!
      } else {
        res.status(404).json({ error: '한국어 명언을 찾을 수 없습니다.' });
      }
    }
  });
});






// 서버 실행 (환경 변수 PORT 사용, 기본값 3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
