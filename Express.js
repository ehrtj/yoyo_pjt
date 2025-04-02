const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

// CORS 설정
app.use(cors());
app.use(express.json()); // JSON 요청 처리

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./quotesDB.db', (err) => {
  if (err) {
    console.error('데이터베이스 연결 오류:', err.message);
  } else {
    console.log('✅ SQLite 연결 성공');
  }
});

// HTML 파일 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 🇰🇷 한국어 명언 가져오기
app.get('/random-quote-ko', (req, res) => {
  const query = 'SELECT * FROM quotes_ko ORDER BY RANDOM() LIMIT 1';
  db.get(query, [], (err, row) => {
    if (err) {
      console.error('❌ 데이터 조회 오류:', err.message);
      return res.status(500).json({ error: '명언을 가져오는 데 실패했습니다.' });
    }
    res.json(row ? { quote: row.quote } : { error: '명언을 찾을 수 없습니다.' });
  });
});

// 🇺🇸 영어 명언 가져오기
app.get('/random-quote-en', (req, res) => {
  const query = 'SELECT * FROM quotes_en ORDER BY RANDOM() LIMIT 1';
  db.get(query, [], (err, row) => {
    if (err) {
      console.error('❌ 데이터 조회 오류:', err.message);
      return res.status(500).json({ error: '명언을 가져오는 데 실패했습니다.' });
    }
    res.json(row ? { quote: row.quote } : { error: '명언을 찾을 수 없습니다.' });
  });
});

// 🏆 랭킹 저장
app.post('/save-ranking', (req, res) => {
  const { name, time, cpm, language } = req.body;
  if (!name || !time || !cpm || !language) {
    return res.status(400).json({ error: '모든 필드를 입력해야 합니다.' });
  }

  const query = 'INSERT INTO rankings (name, time, cpm, language) VALUES (?, ?, ?, ?)';
  db.run(query, [name, time, cpm, language], function (err) {
    if (err) {
      console.error('❌ 랭킹 저장 실패:', err.message);
      return res.status(500).json({ error: '랭킹 저장 실패' });
    }
    res.json({ message: '✅ 랭킹 저장 성공', id: this.lastID });
  });
});

// 🔍 랭킹 조회
app.get('/get-rankings/:language', (req, res) => {
  const { language } = req.params;
  const query = 'SELECT * FROM rankings WHERE language = ? ORDER BY cpm DESC LIMIT 10';
  
  db.all(query, [language], (err, rows) => {
    if (err) {
      console.error('❌ 랭킹 조회 실패:', err.message);
      return res.status(500).json({ error: '랭킹을 가져오는 데 실패했습니다.' });
    }
    res.json(rows);
  });
});

// ❌ 랭킹 삭제
app.delete('/delete-ranking/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM rankings WHERE id = ?';
  
  db.run(query, [id], function (err) {
    if (err) {
      console.error('❌ 삭제 실패:', err.message);
      return res.status(500).json({ error: '삭제 실패' });
    }
    res.json({ message: `✅ ID ${id} 삭제 완료`, affectedRows: this.changes });
  });
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
});
