// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDN9n67TRbykdXiNNepu3xp6QKGdpqkpvA",
    authDomain: "output-predict.firebaseapp.com",
    projectId: "output-predict",
    storageBucket: "output-predict.firebasestorage.app",
    messagingSenderId: "918258740172",
    appId: "1:918258740172:web:c6363788b7fe4f4e64cb69",
    measurementId: "G-Y62F7YH7T4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Admin State
let adminState = {
    users: [],
    resultsPublished: false
};

// Initialize Admin Page
function initAdminPage() {
    // Check if user is admin
    const currentUser = localStorage.getItem('currentUser');
    const userRole = localStorage.getItem('userRole');

    if (!currentUser || userRole !== 'admin') {
        alert('Access Denied. Admin login required.');
        window.location.href = 'index.html';
        return;
    }

    // Load admin data
    loadAdminData();

    // Setup event listeners
    setupAdminEventListeners();
}

// Load Admin Data from Firestore
async function loadAdminData() {
    try {
        // Fetch all students
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'student'));
        const querySnapshot = await getDocs(q);

        adminState.users = [];
        querySnapshot.forEach((doc) => {
            adminState.users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Update UI
        updateAdminStats();
        updatePublishStatus();
        displayLeaderboard();

    } catch (error) {
        console.error('Error loading admin data:', error);
        document.getElementById('leaderboardBody').innerHTML = 
            '<tr><td colspan="7" class="loading-text">Error loading data</td></tr>';
    }
}

// Update Admin Statistics
function updateAdminStats() {
    const totalUsers = adminState.users.length;
    const submittedCount = adminState.users.filter(u => u.submittedAt).length;
    const pendingCount = totalUsers - submittedCount;

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('submittedCount').textContent = submittedCount;
    document.getElementById('pendingCount').textContent = pendingCount;
}

// Display Leaderboard
function displayLeaderboard() {
    const tbody = document.getElementById('leaderboardBody');
    tbody.innerHTML = '';

    if (!adminState.users || adminState.users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-text">No participants yet</td></tr>';
        return;
    }

    // Sort users: by score (desc), then by timeTaken (asc), then by submittedAt (asc)
    const sortedUsers = [...adminState.users]
        .filter(u => u.submittedAt) // Only show submitted users
        .sort((a, b) => {
            // Score descending
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            // Time taken ascending
            if (a.timeTaken !== b.timeTaken) {
                return a.timeTaken - b.timeTaken;
            }
            // Submitted time ascending
            const aTime = new Date(a.submittedAt.seconds * 1000);
            const bTime = new Date(b.submittedAt.seconds * 1000);
            return aTime - bTime;
        });

    if (sortedUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-text">No submissions yet</td></tr>';
        return;
    }

    // Display leaderboard
    sortedUsers.forEach((user, index) => {
        const row = document.createElement('tr');
        const timeTakenFormatted = formatTime(user.timeTaken || 0);
        const submittedAt = user.submittedAt 
            ? new Date(user.submittedAt.seconds * 1000).toLocaleString() 
            : '-';

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.name || 'N/A'}</td>
            <td>${user.rollNo || 'N/A'}</td>
            <td>${user.year || 'N/A'}</td>
            <td><strong>${user.score || 0}/30</strong></td>
            <td>${timeTakenFormatted}</td>
            <td>${submittedAt}</td>
        `;

        tbody.appendChild(row);
    });

    // Add pending users (not submitted)
    const pendingUsers = adminState.users.filter(u => !u.submittedAt);
    if (pendingUsers.length > 0) {
        pendingUsers.forEach((user) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>-</td>
                <td>${user.name || 'N/A'}</td>
                <td>${user.rollNo || 'N/A'}</td>
                <td>${user.year || 'N/A'}</td>
                <td><em>Not Submitted</em></td>
                <td>-</td>
                <td>-</td>
            `;
            row.style.opacity = '0.6';
            tbody.appendChild(row);
        });
    }
}

// Format Time
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
}

// Confirm Publish Results
function confirmPublish() {
    const unsubmittedCount = adminState.users.filter(u => !u.submittedAt).length;

    if (unsubmittedCount > 0) {
        const confirmMsg = `⚠️ There are ${unsubmittedCount} participants who haven't submitted yet.\n\nPublish results anyway?`;
        if (!confirm(confirmMsg)) {
            return;
        }
    } else {
        if (!confirm('Publish results? This action cannot be undone.')) {
            return;
        }
    }

    publishResults();
}

// Publish Results to Firestore
async function publishResults() {
    try {
        const configRef = doc(db, 'config', 'quiz_settings');
        await updateDoc(configRef, {
            resultsPublished: true,
            publishedAt: new Date()
        }).catch(async (error) => {
            // If document doesn't exist, create it
            if (error.code === 'not-found') {
                const { setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js');
                await setDoc(configRef, {
                    resultsPublished: true,
                    publishedAt: new Date()
                });
            } else {
                throw error;
            }
        });

        adminState.resultsPublished = true;
        updatePublishStatus();
        alert('✅ Results published successfully! Students can now view the leaderboard.');

    } catch (error) {
        console.error('Error publishing results:', error);
        alert('❌ Failed to publish results. Please try again.');
    }
}

// Update Publish Status Display
function updatePublishStatus() {
    const publishStatus = document.getElementById('publishStatus');
    if (publishStatus) {
        if (adminState.resultsPublished) {
            publishStatus.textContent = 'Results: Published ✓';
            publishStatus.classList.add('published');
        } else {
            publishStatus.textContent = 'Results: Not Published';
            publishStatus.classList.remove('published');
        }
    }
}

// Setup Admin Event Listeners
function setupAdminEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    const publishBtn = document.getElementById('publishBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleAdminLogout);
    }

    if (publishBtn) {
        publishBtn.addEventListener('click', confirmPublish);
    }
}

// Handle Admin Logout
function handleAdminLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRollNo');
    window.location.href = 'index.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initAdminPage);

// Auto refresh leaderboard every 10 seconds
setInterval(() => {
    loadAdminData();
}, 10000);