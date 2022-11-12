import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import joi from "joi";
import dayjs from 'dayjs';

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const nameSchema = joi.object({
  name: joi.string().required().min(2).max(30),
});

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
  const body = req.body;

  const newUser = {
    name: body,
    lastStatus: Date.now()
  }

  const firstMessage = {
    from: body.name,
    to: 'Todos',
    text: 'entra na sala...',
    type: 'status',
    time: 'HH:MM:SS'
  }

  const validation = nameSchema.validate(body, {abortEarly: false});
  
  if (validation.error) {
    const errors = validation.error.details.map((d) => d.message);
    res.send(errors);
    return;
  }

  // let date = [dayjs().locale("pt").format("dddd, D/MM/YYYY")]
  // let horas = now.getHours()
  
  try {
    const responseParticipant = await collectionParticipants.insertOne({ newUser });
    res.sendStatus(201);
    console.log(responseParticipant)
  } catch (err) {
    console.log(err);
  }

  // try {
  //   const responseMessage = await collectionMessages.insertOne({ firstMessage });
  //   res.sendStatus(201);
  //   console.log(responseMessage)
  // } catch (err) {
  //   console.log(err);
  // }
})



app.listen(process.env.PORT, () => console.log(`App is running on port ${process.env.PORT}`));
