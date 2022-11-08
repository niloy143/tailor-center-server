require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const jwtAccessCode = process.env.JWT_ACCESS_CODE;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send({ status: 'running' })
})

app.post('/jwt', (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, jwtAccessCode);
    res.send({ token });
})

app.listen(port, () => {
    console.log(`Server is listening to ${port}`)
})