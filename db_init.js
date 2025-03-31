const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const fs = require('fs');

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('./quiz.db', (err) => {
    if (err) {
      console.error('데이터베이스 연결 실패:', err.message);
    } else {
      console.log('SQLite 데이터베이스 연결 성공');
    }
  });

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        number INTEGER NOT NULL,
        subject TEXT NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL,  -- JSON 형태로 저장
        answer TEXT NOT NULL
      )
    `);
 });