const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');

// CORS 설정
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));  // 업로드된 이미지를 정적 파일로 제공

// SQLite DB 연결
const db = new sqlite3.Database('./questions.db', (err) => {
  if (err) {
    console.error('DB 연결 오류:', err.message);
  } else {
    console.log('DB 연결 성공');
  }
});


// multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // 이미지를 저장할 폴더
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));// 파일 이름을 고유하게 설정
    }
  });

  const upload = multer({ storage: storage });
  
  


// 문제와 이미지 추가 API
app.post('/add-question', upload.single('image'), (req, res) => {
  const { year, number, subject, question, options, answer } = req.body;
  const image = req.file ? req.file.path : null; // 업로드된 이미지 경로


  // 요청 데이터가 제대로 들어왔는지 확인
  if (!year || !number || !subject || !question || !options || !answer) {
    return res.status(400).json({ error: '모든 필드를 채워주세요.' });
  }

  // options 배열을 문자열로 변환
  const optionsString = JSON.stringify(options);

  // SQL 쿼리
  const sql = `
  INSERT INTO questions (year, number, subject, question, options, answer, image)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`;

  // DB에 문제와 이미지 정보 저장
  db.run(sql, [year, number, subject, question, optionsString, answer, image], function (err) {
    if (err) {
      console.error('문제 추가 중 오류 발생:', err.message);
      return res.status(500).json({ error: '문제 추가에 실패했습니다.' });
    }
    res.status(200).json({ message: '문제가 성공적으로 추가되었습니다.', id: this.lastID });
  });
});



//이미지를 불러오기 위한 api
app.get('/questions', (req, res) => {
    const sql = 'SELECT * FROM questions';
  
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      const result = rows.map(row => ({
        ...row,
        options: JSON.parse(row.options),
        image: row.image ? `http://localhost:3000/${row.image}` : null // 절대 경로로 반환
      }));
      res.json(result);
    });
});

  //fetch에서 이미지 경로 처리리
  fetch('http://localhost:3000/questions')
  .then(response => response.json())
  .then(data => {
    data.forEach(question => {
      // 이미지 경로가 있으면 그 이미지 URL을 표시
      if (question.image) {
        console.log('업로드된 이미지:', question.image);
        // 예시: HTML에서 이미지 보여주기
        const img = document.createElement('img');
        img.src = question.image; // 이미지를 올바른 URL로 설정
        img.alt = "문제 이미지"; // 대체 텍스트 추가 (선택 사항)
        img.style.maxWidth = "300px"; // 이미지 크기 조정 (선택 사항)
        document.body.appendChild(img);
      }
    });
  })
  .catch(error => console.error('Error fetching data:', error));
  

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
