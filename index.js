import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const nameSchema = joi.object({
  name: joi.string().required().min(2).max(30)
});

let time = new Date();
let currentTime = time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds();
let lastStatus = Date.now();

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  await mongoClient.connect();
  console.log('MongoDB connected');
} catch (err) {
  console.log(err);
}

let db = mongoClient.db('UOL');
let collectionParticipants = db.collection('participants');
let collectionMessages = db.collection('messages');

app.post('/participants', async (req, res) => {
  const {name} = req.body;

  const validation = nameSchema.validate({name}, {abortEarly: false});
  
  if (validation.error) {
    const errors = validation.error.details.map((d) => d.message);
    res.send(errors);
    return;
  }
  
  try {
    const responseParticipant = await collectionParticipants.insertOne({ name, lastStatus: lastStatus });
    res.sendStatus(201);
    console.log(responseParticipant)
  } catch (err) {
    res.status(500).send(err);
  }

  // try {
  //   const responseMessage = await collectionMessages.insertOne({from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: currentTime});
  //   res.sendStatus(201);
  //   console.log(responseMessage)
  // } catch (err) {
  //   console.log(err);
  // }
})

app.get('/participants', async (req, res) => {
  try {
    const participants = await collectionParticipants.find().toArray();
    console.log(participants);
    res.sendStatus(200);   
  } catch (err) {
    res.status(500).send(err);
  }
  
});




app.listen(process.env.PORT, () => console.log(`App is running on port ${process.env.PORT}`));
