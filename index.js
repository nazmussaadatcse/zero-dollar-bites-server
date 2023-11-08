const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
// middleware
app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tjhl6td.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect();

        const foodCollection = client.db('ZDB_foodDB').collection('food');
        const requestCollection = client.db('ZDB_foodDB').collection('request');

        // create data on db 
        app.post('/food', async (req, res) => {
            const newFood = req.body;
            console.log(newFood);
            const result = await foodCollection.insertOne(newFood);
            res.send(result);
        })

        app.post('/requested', async (req, res) => {
            const requestedFood = req.body;
            console.log(requestedFood);
            const result = await requestCollection.insertOne(requestedFood);
            res.send(result);
        })
        app.get('/requested', async (req, res) => {
            const cursor = requestCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // read data from db 
        app.get('/food', async (req, res) => {
            const cursor = foodCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/food/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const food = await foodCollection.findOne(query);
            res.json(food);
        });
        app.get('/requested/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const food = await foodCollection.findOne(query);
            res.json(food);
        });

        app.put('/food/:id', async (req, res) => {
            const id = req.params.id;
            const query = { 
                _id: new ObjectId(id) 
            }
            const options = { upsert: true }
            const updatedFood = req.body;
            console.log(updatedFood);
            const food = {
                $set: {
                    name: updatedFood.name,
                    quantity: updatedFood.quantity,
                    photo: updatedFood.photo,
                    pickup_location: updatedFood.pickup_location,
                    expiry_date: updatedFood.expiry_date,
                    additional_notes: updatedFood.additional_notes,
                }
            }
            const result = await foodCollection.updateOne(query, food, options);
            res.send(result);
        })


        app.delete('/food/:id', async (req, res) => {
            const id = req.params.id;
            const email = req.query.email;
            const query = {
                _id: new ObjectId(id),
                email: email
            }
            console.log(query);
            const result = await foodCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        })

        app.delete('/requested/:id', async (req, res) => {
            const id = req.params.id;
            const email = req.query.email;
            const query = {
                _id: new ObjectId(id),
                requesterEmail: email
            }
            console.log(query);
            const result = await requestCollection.deleteOne(query);
            console.log(result);
            res.send(result);
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('ZDB server is running');
})

app.listen(port, () => {
    console.log(`ZDB server online on port ${port}`);
})