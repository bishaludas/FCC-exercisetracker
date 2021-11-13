require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.urlencoded());
app.use(express.json());
app.use(cors());

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.connect(process.env["MONGO_URI"]);

const UserSchema = new Schema({
  username: { type: String, required: true },
});
let User = mongoose.model("UserSchema", UserSchema);

const ExerciseSchema = new Schema({
  userid: { type: String, required: true },
  username: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

let Exercise = mongoose.model("ExerciseSchema", ExerciseSchema);

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", async (req, res) => {
  // check if user exists and return if it does
  let userCheck = await User.find();

  if (userCheck !== null && userCheck.length > 0) {
    return res.json(userCheck);
  }
});

app.post("/api/users", async (req, res) => {
  // check if user exists and return if it does
  let userCheck = await User.findOne({ username: req.body.username });

  if (userCheck !== null && Object.keys(userCheck).length !== 0) {
    console.log("User already exists, returning data.");
    return res.json(userCheck);
  }

  let userObj = new User({
    username: req.body.username,
  });

  userObj.save((err, data) => {
    if (err) return console.error(err);
    res.json(data);
  });
});

app.post("/api/users/:id/exercises", async (req, res) => {
  let id = req.params.id;
  let input = req.body;

  let user = await User.findOne({ _id: id });
  if (user === null) {
    return res.json({ error: "Invalid user" });
  }

  if (input.description === "") {
    return res.json("Path `description` is required.");
  }
  if (input.duration === "") {
    return res.json("Path `duration` is required.");
  }
  console.log(input);

  input.username = user.username;
  let ExerciseObj = new Exercise({
    userid: input[":_id"],
    username: input.username,
    description: input.description,
    duration: input.duration,
    date: input.date === "" ? new Date() : new Date(input.date),
  });

  ExerciseObj.save((err, data) => {
    if (err) return console.error(err);
    res.json(data);
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
