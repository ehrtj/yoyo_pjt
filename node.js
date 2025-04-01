const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./quotesDB.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('SQLite 연결 성공');
  }
});

// HTML 파일을 제공하는 엔드포인트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// /random-quote-ko API - 한국어 명언 가져오기
app.get('/random-quote-ko', (req, res) => {
  const query = 'SELECT * FROM quotes_ko ORDER BY RANDOM() LIMIT 1'; // 한국어 명언을 랜덤으로 가져오기
  console.log('Executing query:', query);

  db.get(query, [], (err, row) => {
    if (err) {
      console.error('데이터 조회 오류:', err.message);
      res.status(500).json({ error: '명언을 가져오는 데 실패했습니다.' });
    } else {
      if (row) {
        console.log('Fetched quote:', row);
        // 'quote' 필드를 실제 DB 컬럼에 맞게 수정
        res.json({ quote: row.quote }); // 명언 JSON 형식으로 반환
      } else {
        res.status(404).json({ error: '명언을 찾을 수 없습니다.' });
      }
    }
  });
});

// 서버 실행
const PORT = process.env.PORT || 3001; // 포트 번호 환경 변수로 지정 가능
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
