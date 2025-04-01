const express = require('express');
const path = require('path');
const app = express();

// HTML 파일을 제공하는 엔드포인트
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 실행
app.listen(3001, () => {
    console.log('서버가 http://localhost:3001 에서 실행 중입니다.');
});
