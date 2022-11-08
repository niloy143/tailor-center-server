require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
const jwtAccessCode = process.env.JWT_ACCESS_CODE;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sq5icdb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const servicesCollection = client.db('tailorCenter').collection('services');

        app.get('/services', async (req, res) => {
            const limitation = parseInt(req.query.count) || 0;
            const cursor = servicesCollection.find({});
            const services = await cursor.limit(limitation).toArray();
            res.send(services);
        })

        app.get('/service/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) };
            const service = await servicesCollection.findOne(query);
            res.send(service)
        })
    }
    catch (err) {
        console.log(err.code)
    }
}

run().catch(err => console.log(err))

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