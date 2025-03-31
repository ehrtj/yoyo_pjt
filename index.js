const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors'); 
app.use(cors())

app.use(express.json());

const sqlite3 = require('sqlite3').verbose();

app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });


app.get('/q' , (req,res) => {
    res.send("ok")
})

// 기출 문제 삽입 API (예시)
app.post('/add-question', (req, res) => {
    const { year, subject, number, question, options, answer } = req.body;
  
    // `options`는 JSON 형태로 전달되므로, 문자열로 저장
    const optionsString = JSON.stringify(options);
  
    const sql = `
      INSERT INTO questions (year, subject, question, options, answer) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [year, subject, question, optionsString, answer], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({
        message: '문제 추가 완료',
        id: this.lastID
      });
    });
  });

  // 기출 문제 조회 API
app.get('/questions', (req, res) => {
    const sql = 'SELECT * FROM questions';
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // `options`를 JSON으로 파싱해서 반환
      const result = rows.map(row => ({
        ...row,
        options: JSON.parse(row.options)  // options를 다시 객체로 변환
      }));
      res.json(result);
    });
  });
  