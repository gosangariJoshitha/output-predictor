const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= DATABASE CONNECTION ================= */

mongoose.connect("mongodb+srv://Quizadmin:Quizadmin123@cluster0.z6yqukn.mongodb.net/outputPredictor?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error:", err));
/* ================= SCHEMAS ================= */

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  year: { type: String, required: true },
  password: { type: String, required: true },
  score: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  submittedAt: { type: Date, default: null },
  hasAttempted: { type: Boolean, default: false },
  role: { type: String, default: "student" }
});

const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  language: { type: String, required: true },
  question: String,
  code: String,
  options: [String],
  correctAnswer: String
});

const User = mongoose.model("User", userSchema);
const Question = mongoose.model("Question", questionSchema);

/* ================= ROUTES ================= */

/* ---------- REGISTER ---------- */
app.post("/register", async (req, res) => {
  try {
    const { name, rollNo, year, password } = req.body;

    if (!name || !rollNo || !year || !password) {
      return res.json({ success: false, message: "All fields required" });
    }

    const existing = await User.findOne({ rollNo });

    if (existing) {
      return res.json({ success: false, message: "Roll number already registered" });
    }

    await User.create({ name, rollNo, year, password });

    res.json({ success: true, message: "Registered Successfully" });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Registration failed" });
  }
});

/* ---------- LOGIN ---------- */
app.post("/login", async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    // Admin Login
    if (rollNo === "ADMIN" && password === "admin@123") {
      return res.json({ success: true, role: "admin" });
    }

    const user = await User.findOne({ rollNo, password });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    if (user.hasAttempted) {
      return res.json({ success: false, message: "You have already attempted the quiz" });
    }

    res.json({
      success: true,
      role: "student",
      name: user.name,
      rollNo: user.rollNo,
      year: user.year
    });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Login failed" });
  }
});

/* ---------- GET QUESTIONS (Hide Answers) ---------- */
app.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find({}, "-correctAnswer -_id");
    res.json(questions);
  } catch (err) {
    console.log(err);
    res.json([]);
  }
});

/* ---------- SUBMIT QUIZ ---------- */
app.post("/submit", async (req, res) => {
  try {
    const { answers, userData } = req.body;

    const user = await User.findOne({ rollNo: userData.rollNo });

    if (!user || user.hasAttempted) {
      return res.json({ success: false, message: "Invalid submission" });
    }

    const questions = await Question.find();
    let score = 0;

    // 1 mark per correct answer
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        score += 1;
      }
    });

    user.score = score;
    user.timeTaken = userData.timeTaken;
    user.submittedAt = new Date();
    user.hasAttempted = true;

    await user.save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Submission failed" });
  }
});

/* ---------- LEADERBOARD ---------- */
app.get("/leaderboard", async (req, res) => {
  try {
    const users = await User.find({ hasAttempted: true })
      .sort({
        score: -1,        // Higher score first
        timeTaken: 1,     // Lower time first
        submittedAt: 1    // Earlier submission wins
      });

    res.json(users);
  } catch (err) {
    console.log(err);
    res.json([]);
  }
});

/* ================= SERVER ================= */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});