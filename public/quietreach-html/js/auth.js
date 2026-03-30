document.addEventListener('DOMContentLoaded', function () {
    if (isLoggedIn()) { redirectByRole(getCurrentUser().role); return; }
    setupRoleTabs();
    const form = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('submit', fn); };
    form('loginForm',       handleLogin);
    form('adminLoginForm',  handleAdminLogin);
    form('mentorLoginForm', handleMentorLogin);
    form('motherLoginForm', handleMotherLogin);
    form('registerForm',    handleRegister);
});

function setupRoleTabs() {
    const tabs = document.querySelectorAll('.role-tab');
    const input = document.getElementById('selectedRole');
    if (!tabs.length) return;
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            if (input) input.value = this.getAttribute('data-role');
        });
    });
}

function showError(id, msg) { const el = document.getElementById(id); if (el) { el.textContent = msg; el.classList.add('show'); } }
function hideError(id)      { const el = document.getElementById(id); if (el) el.classList.remove('show'); }

async function handleAdminLogin(e) {
    e.preventDefault(); hideError('errorMessage');
    try {
        const data = await loginUser(document.getElementById('username').value.trim(), document.getElementById('password').value, 'admin');
        if (!data) return;
        setCurrentUser(data.user);
        window.location.href = 'admin.html';
    } catch (err) { showError('errorMessage', err.message); }
}

async function handleMentorLogin(e) {
    e.preventDefault(); hideError('errorMessage');
    try {
        const data = await loginUser(document.getElementById('username').value.trim(), document.getElementById('password').value, 'mentor');
        if (!data) return;
        setCurrentUser(data.user);
        window.location.href = 'dashboard-mentor.html';
    } catch (err) { showError('errorMessage', err.message); }
}

async function handleMotherLogin(e) {
    e.preventDefault(); hideError('errorMessage');
    try {
        const data = await loginUser(document.getElementById('username').value.trim(), document.getElementById('password').value, 'mother');
        if (!data) return;
        setCurrentUser(data.user);
        window.location.href = 'dashboard-mother.html';
    } catch (err) { showError('errorMessage', err.message); }
}

async function handleLogin(e) {
    e.preventDefault(); hideError('errorMessage');
    const role = document.getElementById('selectedRole')?.value || 'mother';
    try {
        const data = await loginUser(document.getElementById('username').value.trim(), document.getElementById('password').value, role);
        if (!data) return;
        setCurrentUser(data.user);
        redirectByRole(data.user.role);
    } catch (err) { showError('errorMessage', err.message); }
}

async function handleRegister(e) {
    e.preventDefault(); hideError('errorMessage');
    const username        = document.getElementById('username').value.trim();
    const password        = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role            = document.getElementById('role').value;
    const specialty       = document.getElementById('specialty')?.value || 'General Support';
    const successEl       = document.getElementById('successMessage');
    if (successEl) successEl.classList.remove('show');
    if (password !== confirmPassword) return showError('errorMessage', 'Passwords do not match.');
    if (password.length < 6)         return showError('errorMessage', 'Password must be at least 6 characters.');
    try {
        const data = await registerUser(username, password, role, specialty);
        if (!data) return;
        if (role === 'mentor') {
            if (successEl) { successEl.textContent = 'Application submitted! Please wait for admin approval before logging in.'; successEl.classList.add('show'); }
            setTimeout(() => { window.location.href = 'login-mentor.html'; }, 3000);
            return;
        }
        setCurrentUser(data.user);
        window.location.href = 'dashboard-mother.html';
    } catch (err) { showError('errorMessage', err.message); }
}
