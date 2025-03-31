const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const fs = require('fs');

// SQLite DB 연결
const db = new sqlite3.Database('./questions.db', (err) => {
    if (err) {
      console.error('DB 연결 오류:', err.message);
    } else {
      console.log('DB 연결 성공');
    }
  });
  
  // 테이블 생성 코드 (한 번만 실행)
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        number INTEGER NOT NULL,
        subject TEXT NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        answer TEXT NOT NULL
      );
    `, (err) => {
      if (err) {
        console.error('테이블 생성 오류:', err.message);
      } else {
        console.log('questions 테이블이 성공적으로 생성되었습니다.');
      }
    });
  });