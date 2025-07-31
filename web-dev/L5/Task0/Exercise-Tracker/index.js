const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const users = [];
const exercises = [];

function formatDate(date) {
  return new Date(date).toDateString();
}

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const user = { _id: uuidv4(), username };
  users.push(user);
  res.json(user);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find((u) => u._id === _id);

  const exercise = {
    userId: _id,
    description,
    duration: parseInt(duration),
    date: date ? formatDate(date) : formatDate(new Date()),
  };

  exercises.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find((u) => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  let userLogs = exercises.filter((e) => e.userId === _id);

  if (from) {
    const fromDate = new Date(from);
    userLogs = userLogs.filter((e) => new Date(e.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userLogs = userLogs.filter((e) => new Date(e.date) <= toDate);
  }

  if (limit) {
    userLogs = userLogs.slice(0, parseInt(limit));
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: userLogs.length,
    log: userLogs.map((e) => ({
      description: e.description,
      duration: e.duration,
      date: e.date,
    })),
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
