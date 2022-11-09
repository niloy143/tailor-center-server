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

const verifyJWT = (req, res, next) => {
    const authToken = req.headers.authtoken;
    if (!authToken) {
        return res.status(401).send({ authorization: 'declined' });
    }
    const token = authToken.split(' ')[1];
    jwt.verify(token, jwtAccessCode, (err, decoded) => {
        if (err) {
            return res.status(401).send({ authorization: 'declined' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const servicesCollection = client.db('tailorCenter').collection('services');
        const reviewsColollection = client.db('tailorCenter').collection('reviews');

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

        app.post('/add-review', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            const userId = req.query?.userId;
            if (userId !== decoded.uid) {
                return res.status(403).send({ access: 'not-allowed' })
            }
            const review = await reviewsColollection.insertOne(req.body)
            res.send({ status: review.acknowledged, data: req.body });
        })

        app.get('/reviews/:id', async (req, res) => {
            const query = { serviceId: req.params?.id };
            const cursor = reviewsColollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
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