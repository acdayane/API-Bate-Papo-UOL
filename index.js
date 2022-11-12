import express from "express";
import cors from "cors";
import {MongoClient} from "mongodb";
import dotenv from "dotenv";
import joi from "joi";

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

const userSchema = joi.object({
  name: joi.string().required().min(2).max(50),
});

//collection participantes = {name: 'João', lastStatus: 12313123}
//collection  mensagens = {from: 'João', to: 'Todos', text: 'oi galera', type: 'message', time: '20:04:37'}

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  await mongoClient.connect();
  console.log('MongoDB conectado');
} catch (err) {
  console.log(err);
}

let db = mongoClient.db('UOL');





app.listen(process.env.PORT, () => console.log(`App is running on port ${process.env.PORT}`));
