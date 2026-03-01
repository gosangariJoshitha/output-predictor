const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const bcrypt = require("bcrypt");
const path = require("path");

// Load Firebase service account credentials from environment or file
let serviceAccount;

if (process.env.SERVICE_ACCOUNT_KEY_BASE64) {
  try {
    serviceAccount = JSON.parse(Buffer.from(process.env.SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString());
  } catch (e) {
    console.error('Failed to parse SERVICE_ACCOUNT_KEY_BASE64:', e);
  }
} else {
  // fallback for local development
  serviceAccount = require("./serviceAccountKey.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, "frontend")));

// Serve index.html for root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

const SALT_ROUNDS = 10;

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  try {
    const { name, rollNo, year, password } = req.body;

    if (!name || !rollNo || !year || !password)
      return res.json({ success: false, message: "All fields required" });

    const userRef = db.collection("users").doc(rollNo);
    const existingUser = await userRef.get();

    if (existingUser.exists)
      return res.json({ success: false, message: "Roll number already exists" });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await userRef.set({
      name,
      rollNo,
      year,
      password: hashedPassword,
      role: "student",
      score: 0,
      timeTaken: 0,
      submittedAt: null,
      hasAttempted: false,
      createdAt: new Date()
    });

    res.json({ success: true, message: "Registered successfully" });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Registration failed" });
  }
});

/* ================= LOGIN ================= */
app.post("/login", async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    // Secure Admin (can move to env later)
    if (rollNo === "ADMIN" && password === "admin@123")
      return res.json({ success: true, role: "admin" });

    const userDoc = await db.collection("users").doc(rollNo).get();

    if (!userDoc.exists)
      return res.json({ success: false, message: "Invalid credentials" });

    const user = userDoc.data();

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.json({ success: false, message: "Invalid credentials" });

    if (user.hasAttempted)
      return res.json({ success: false, message: "You have already attempted the quiz" });

    res.json({
      success: true,
      role: "student",
      name: user.name,
      rollNo: user.rollNo,
      year: user.year
    });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Login failed" });
  }
});

/* ================= GET QUESTIONS ================= */
app.get("/questions", async (req, res) => {
  try {
    const snapshot = await db.collection("questions").orderBy("id").get();
    const questions = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      questions.push({
        id: data.id,
        language: data.language,
        code: data.code,
        options: data.options
      });
    });

    res.json(questions);

  } catch (error) {
    console.error(error);
    res.json([]);
  }
});

/* ================= SUBMIT QUIZ ================= */
app.post("/submit", async (req, res) => {
  try {
    const { answers, userData } = req.body;

    if (!answers || !userData)
      return res.json({ success: false });

    const userRef = db.collection("users").doc(userData.rollNo);
    const userDoc = await userRef.get();

    if (!userDoc.exists)
      return res.json({ success: false });

    const user = userDoc.data();

    if (user.hasAttempted)
      return res.json({ success: false, message: "Already submitted" });

    const questionsSnapshot = await db.collection("questions").get();

    let score = 0;

    questionsSnapshot.forEach(doc => {
      const q = doc.data();
      if (answers[q.id] === q.correctAnswer)
        score++;
    });

    await userRef.update({
      score,
      timeTaken: userData.timeTaken,
      submittedAt: new Date(),
      hasAttempted: true
    });

    res.json({ success: true, score });

  } catch (error) {
    console.error(error);
    res.json({ success: false });
  }
});

/* ================= LEADERBOARD ================= */
app.get("/leaderboard", async (req, res) => {
  try {
    const snapshot = await db.collection("users")
      .where("hasAttempted", "==", true)
      .orderBy("score", "desc")
      .orderBy("timeTaken", "asc")
      .orderBy("submittedAt", "asc")
      .get();

    const users = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        name: data.name,
        rollNo: data.rollNo,
        year: data.year,
        score: data.score,
        timeTaken: data.timeTaken
      });
    });

    res.json(users);

  } catch (error) {
    console.error(error);
    res.json([]);
  }
});

/* ================= RESET USER (Admin Optional) ================= */
app.post("/reset-user", async (req, res) => {
  const { rollNo } = req.body;

  await db.collection("users").doc(rollNo).update({
    score: 0,
    timeTaken: 0,
    submittedAt: null,
    hasAttempted: false
  });

  res.json({ success: true });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});