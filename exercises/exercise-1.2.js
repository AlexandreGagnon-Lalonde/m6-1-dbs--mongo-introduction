const { MongoClient, Db } = require("mongodb");

require("dotenv").config();

const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getCollection = async (dbName) => {
  const client = await MongoClient(MONGO_URI, options);

  await client.connect();

  const db = client.db(dbName);

  const users = await db.collection("users").find().toArray();

  client.close();
  console.log(users);
};

getCollection("exercise_1");
