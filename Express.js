const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');




// MongoDB 연결 설정
mongoose.connect('mongodb://localhost:27017/quotesDB')
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// 데이터베이스 모델 정의
const quoteSchema = new mongoose.Schema({
  quote: String,
  author: String,
  date: { type: Date, default: Date.now }
});

const Quote = mongoose.model('Quote', quoteSchema);

const app = express();
const port = 3000;

// ZenQuotes API URL
const apiUrl = 'https://zenquotes.io/api/random';

// ZenQuotes API 호출 후 DB에 저장하는 함수
const fetchAndStoreQuote = async () => {
  try {
    const response = await axios.get(apiUrl);
    const quoteData = response.data[0]; // 첫 번째 인용문을 가져옴

    // DB에 저장
    const newQuote = new Quote({
      quote: quoteData.q,
      author: quoteData.a
    });

    await newQuote.save(); // MongoDB에 저장
    console.log('Quote saved to database');
  } catch (error) {
    console.error('Error fetching quote:', error);
  }
};

// 서버에서 ZenQuotes API 데이터를 저장하는 라우터
app.get('/save-quote', (req, res) => {
  fetchAndStoreQuote()
    .then(() => res.send('Quote saved successfully!'))
    .catch((error) => res.status(500).send('Error saving quote.'));
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
