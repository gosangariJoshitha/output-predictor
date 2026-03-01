let questions = [];
let currentQuestionIndex = 0;
let answers = {};
let timerInterval;
let isSubmitted = false;

/* ================= ROUTE PROTECTION ================= */

if (!localStorage.getItem("rollNo")) {
    window.location = "login.html";
}

/* ================= PERSISTENT TIMER ================= */

const QUIZ_DURATION = 30 * 60; // 30 minutes

let startTime = localStorage.getItem("quizStartTime");

if (!startTime) {
    startTime = Date.now();
    localStorage.setItem("quizStartTime", startTime);
}

let elapsed = Math.floor((Date.now() - startTime) / 1000);
let timeLeft = QUIZ_DURATION - elapsed;

if (timeLeft <= 0) {
    timeLeft = 0;
}

/* ================= SHUFFLE FUNCTION ================= */

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

/* ================= FETCH QUESTIONS ================= */

fetch("http://localhost:5000/questions")
    .then(res => res.json())
    .then(data => {

        // Shuffle question order per student
        questions = shuffleArray(data);

        // Shuffle options inside each question
        questions.forEach(q => {
            const shuffledOptions = shuffleArray([...q.options]);
            q.options = shuffledOptions;
        });

        initializeGrid();
        displayQuestion();
        startTimer();
    })
    .catch(err => {
        console.error(err);
        alert("Failed to load questions");
    });

/* ================= DISPLAY QUESTION ================= */

function displayQuestion() {

    const question = questions[currentQuestionIndex];

    document.getElementById("questionNumber").innerText =
        "Question " + (currentQuestionIndex + 1);

    document.getElementById("languageTag").innerText =
        question.language.toUpperCase();

    document.getElementById("codeContent").innerText =
        question.code;

    for (let i = 0; i < 4; i++) {

        document.getElementById("optionLabel" + (i + 1)).innerText =
            question.options[i];

        const radio = document.getElementById("option" + (i + 1));
        radio.checked = false;

        // Restore selection
        if (answers[question.id] === question.options[i]) {
            radio.checked = true;
        }
    }

    updateGrid();
    // Ensure navigation buttons reflect position
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    // Enable both buttons; navigation will wrap around in handlers
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;
}

/* ================= SAVE ANSWERS ================= */

document.querySelectorAll("input[name='answer']").forEach(radio => {
    radio.addEventListener("change", function () {

        const question = questions[currentQuestionIndex];

        answers[question.id] = question.options[this.value];

        updateGrid();
    });
});

/* ================= NAVIGATION ================= */

document.getElementById("nextBtn").addEventListener("click", () => {
    if (!questions || questions.length === 0) return;
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    displayQuestion();
});

document.getElementById("prevBtn").addEventListener("click", () => {
    if (!questions || questions.length === 0) return;
    // Wrap-around to last question when at the first
    currentQuestionIndex = (currentQuestionIndex - 1 + questions.length) % questions.length;
    displayQuestion();
});

/* ================= TIMER ================= */

function startTimer() {

    timerInterval = setInterval(() => {

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        document.getElementById("timer").innerText =
            `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz(true); // Auto submit
        }

        timeLeft--;

    }, 1000);
}

/* ================= SUBMIT ================= */

document.getElementById("submitBtn")
    .addEventListener("click", () => submitQuiz(false));

function submitQuiz(auto = false) {

    if (isSubmitted) return;
    isSubmitted = true;

    clearInterval(timerInterval);

    document.getElementById("submitBtn").disabled = true;

    fetch("http://localhost:5000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            answers: answers,
            userData: {
                rollNo: localStorage.getItem("rollNo"),
                name: localStorage.getItem("name"),
                year: localStorage.getItem("year"),
                timeTaken: QUIZ_DURATION - timeLeft
            }
        })
    })
    .then(res => res.json())
    .then(data => {

        if (data.success) {

            localStorage.removeItem("quizStartTime");

            if (auto) {
                alert("Time Up! Quiz Submitted Automatically.");
            } else {
                alert("Quiz Submitted Successfully!");
            }

            window.location = "index.html";

        } else {
            alert("Submission failed");
        }
    });
}

/* ================= QUESTION GRID ================= */

function initializeGrid() {

    const grid = document.getElementById("questionGrid");
    grid.innerHTML = "";

    questions.forEach((q, index) => {

        const btn = document.createElement("div");
        btn.classList.add("grid-item");
        btn.innerText = index + 1;

        btn.addEventListener("click", () => {
            currentQuestionIndex = index;
            displayQuestion();
        });

        grid.appendChild(btn);
    });
}

function updateGrid() {

    const gridItems = document.querySelectorAll(".grid-item");

    gridItems.forEach((item, index) => {

        item.classList.remove("green", "blue");

        if (index === currentQuestionIndex) {
            item.classList.add("blue");
        }
        else if (answers[questions[index].id]) {
            item.classList.add("green");
        }
    });
}

/* ================= PREVENT REFRESH CHEAT ================= */

window.addEventListener("beforeunload", function (e) {
    if (!isSubmitted) {
        e.preventDefault();
        e.returnValue = "";
    }
});

/* ================= DISABLE RIGHT CLICK ================= */

document.addEventListener("contextmenu", e => e.preventDefault());

/* ================= LOGOUT ================= */

document.getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("quizStartTime");
        localStorage.clear();
        window.location = "login.html";
});

/* ================= FORCE FULL SCREEN ================= */

function enterFullScreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    }
}

enterFullScreen();

// If user exits fullscreen → auto submit
document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && !isSubmitted) {
        alert("You exited full screen. Quiz will be submitted.");
        submitQuiz(true);
    }
});

/* ================= TAB SWITCH DETECTION ================= */

document.addEventListener("visibilitychange", function () {
    if (document.hidden && !isSubmitted) {
        alert("Tab switching detected. Quiz will be submitted.");
        submitQuiz(true);
    }
});

/* ================= BLOCK DEVTOOLS ================= */

document.addEventListener("keydown", function (e) {

    // F12
    if (e.key === "F12") {
        e.preventDefault();
    }

    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
    }

    // Ctrl+U
    if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
    }

});

/* ================= DISABLE COPY PASTE ================= */

document.addEventListener("copy", e => e.preventDefault());
document.addEventListener("paste", e => e.preventDefault());
document.addEventListener("cut", e => e.preventDefault());
document.addEventListener("selectstart", e => e.preventDefault());
