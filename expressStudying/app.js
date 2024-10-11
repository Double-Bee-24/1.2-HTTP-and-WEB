const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

function readCounter() {
  const data = fs.readFileSync("database.txt", "utf-8");
  const counter = parseInt(data);
  return counter;
}

function writeCounter(newCounter) {
  fs.writeFileSync("database.txt", String(newCounter), "utf-8");
}

app.get("/", (req, res) => {
  let counter = readCounter();

  counter++;

  writeCounter(counter);

  res.send(`${counter}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
