const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ SQLite 데이터베이스 연결
const db = new sqlite3.Database('./quotesDB.db', (err) => {
  if (err) {
    console.error('❌ 데이터베이스 연결 오류:', err.message);
    return;
  }
  console.log('✅ SQLite 연결 성공');

  // ✅ 테이블 구조 확인 (quotes 테이블)
  db.all("PRAGMA table_info(quotes);", [], (err, rows) => {
    if (err) {
      console.error('❌ quotes 테이블 정보 조회 오류:', err);
      return;
    }
    console.log('📝 quotes 테이블 구조:', rows);
  });

  // ✅ quotes 테이블에서 샘플 데이터 확인
  db.all("SELECT * FROM quotes LIMIT 5;", [], (err, rows) => {
    if (err) {
      console.error('❌ quotes 데이터 조회 오류:', err);
      return;
    }
    console.log('📝 quotes 테이블 샘플 데이터:', rows);
  });

  // ✅ rankings 테이블이 없으면 생성
  db.run(
    `CREATE TABLE IF NOT EXISTS rankings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      time REAL,
      cpm REAL,
      language TEXT
    )`,
    (err) => {
      if (err) {
        console.error('❌ rankings 테이블 생성 실패:', err);
      } else {
        console.log('✅ rankings 테이블 확인 완료!');
      }
    }
  );
});

// ✅ 한국어 명언 가져오기 API
app.get('/random-quote-ko', (req, res) => {
  const query = 'SELECT * FROM quotes_ko ORDER BY RANDOM() LIMIT 1';

  db.get(query, [], (err, row) => {
    if (err) {
      console.error('❌ 한국어 명언 조회 오류:', err);
      return res.status(500).json({ error: 'DB 조회 오류' });
    }
    if (row) {
      res.json({ quote: row.text });
    } else {
      res.status(404).json({ error: '명언을 찾을 수 없습니다.' });
    }
  });
});

// ✅ 영어 명언 가져오기 API (오류 수정!)
app.get('/random-quote-en', (req, res) => {
  const query = 'SELECT * FROM quotes ORDER BY RANDOM() LIMIT 1';

  db.get(query, [], (err, row) => {
    if (err) {
      console.error('❌ 영어 명언 조회 오류:', err);
      return res.status(500).json({ error: 'DB 조회 오류' });
    }
    if (row) {
      res.json({ quote: row.quote, author: row.author }); // 🔥 수정된 부분!
    } else {
      res.status(404).json({ error: '명언을 찾을 수 없습니다.' });
    }
  });
});

// 🏆 랭킹 저장 API
app.post('/save-ranking', (req, res) => {
  const { name, time, cpm, language } = req.body;

  if (!name || !time || !cpm || !language) {
    return res.status(400).json({ error: '잘못된 데이터' });
  }

  db.run(
    `INSERT INTO rankings (name, time, cpm, language) VALUES (?, ?, ?, ?)`,
    [name, time, cpm, language],
    function (err) {
      if (err) {
        console.error('❌ 랭킹 저장 실패:', err);
        return res.status(500).json({ error: 'DB 저장 오류' });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// 🏅 랭킹 불러오기 API (언어별 조회)
app.get('/get-rankings/:lang', (req, res) => {
  const language = req.params.lang;

  db.all(
    `SELECT * FROM rankings WHERE language = ? ORDER BY time ASC LIMIT 5`,
    [language],
    (err, rows) => {
      if (err) {
        console.error('❌ 랭킹 불러오기 실패:', err);
        return res.status(500).json({ error: 'DB 조회 오류' });
      }
      res.json(rows);
    }
  );
});

// 🚀 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
