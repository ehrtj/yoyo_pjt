const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');  // CORS 모듈 불러오기

const app = express();  // app 객체 먼저 선언

// CORS 미들웨어 설정
app.use(cors());  // 모든 요청에 대해 CORS 허용

const db = new sqlite3.Database('./quotesDB.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('SQLite 연결 성공');
  }
});

const port = 3000;

// /random-quote API - 랜덤 명언 가져오기
app.get('/random-quote', (req, res) => {
  const query = 'SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1'; // 기존의 quotes 테이블 사용
  console.log('Executing query:', query); // 쿼리 실행 로그 출력
  
  db.get(query, [], (err, row) => {
    if (err) {
      console.error('데이터 조회 오류:', err.message); // 오류 메시지 출력
      res.status(500).json({ error: '명언을 가져오는 데 실패했습니다.' });
    } else {
      if (row) {
        console.log('Fetched quote:', row); // 가져온 명언 출력
        res.json(row); // 명언 JSON 형식으로 반환
      } else {
        res.status(404).json({ error: '명언을 찾을 수 없습니다.' }); // 명언이 없으면 404 반환
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
