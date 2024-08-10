// frontend/script.js
const registerBtn = document.getElementById('register-btn');
const loginBtn = document.getElementById('login-btn');
const markAttendanceBtn = document.getElementById('mark-attendance-btn');
const attendanceList = document.getElementById('attendance-list');
let userId = null;
let token = null;

registerBtn.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    alert(data.message);
});

loginBtn.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    
    if (data.token) {
        token = data.token;
        userId = data.userId; // Store user ID
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('attendance-container').style.display = 'block';

        // Start QR code scanner
        const html5QrCode = new Html5Qrcode("reader");
        html5QrCode.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            qrCodeMessage => {
                // Process QR code message
                if (qrCodeMessage === data.qrCode) {
                    document.getElementById('mark-attendance-btn').style.display = 'block';
                }
            },
            errorMessage => {
                // QR code not found
            }
        ).catch(err => {
            console.error(err);
        });
    }
});

markAttendanceBtn.addEventListener('click', async () => {
    const response = await fetch('http://localhost:5000/api/attendance/mark', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
    });
    const data = await response.json();
    alert(data.message);
    loadAttendance();
});

async function loadAttendance() {
    const response = await fetch(`http://localhost:5000/api/attendance/${userId}`);
    const attendances = await response.json();
    attendanceList.innerHTML = '';
    attendances.forEach(attendance => {
        const li = document.createElement('li');
        li.textContent = `Date: ${new Date(attendance.date).toLocaleDateString()} - Status: ${attendance.status}`;
        attendanceList.appendChild(li);
    });
    document.getElementById('attendance-list-container').style.display = 'block';
}
