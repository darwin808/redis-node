const express = require("express");
const axios = require("axios");
const util = require("util");
const port = 3000;
const { createClient } = require("redis");
const redisUrl = process.env.REDIS_URL;
const app = express();

app.use(express.json());

app.post("/", async (req, res) => {
  const { key, value } = req.body;

  const client = createClient({ url: redisUrl });

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  await client.set("key", "value");
  const response = await client.get("key");
  res.status(200).send({
    data: {
      key,
      value,
      response,
    },
  });
});

app.get("/dev/:id", async (req, res) => {
  const client = createClient({ url: redisUrl });
  const { id } = req.params;
  const todos = `https://jsonplaceholder.typicode.com/todos/${id}`;

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  const cachedPost = await client.get(`post-${id}`);
  if (cachedPost) {
    return res.status(200).send({
      data: {
        fetch: JSON.parse(cachedPost),
      },
    });
  }

  const fetch = await axios.get(todos);
  client.set(`post-${id}`, JSON.stringify(fetch.data));

  return res.status(200).send({
    data: {
      fetch: fetch.data,
    },
  });
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
