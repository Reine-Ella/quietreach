/* ========================================
   QuietReach - Chat (Mother View)
   ======================================== */

let selectedMentor = null;

document.addEventListener('DOMContentLoaded', async function () {
    if (!requireAuth()) return;
    const user = getCurrentUser();
    if (user.role !== 'mother') {
        window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard-mentor.html';
        return;
    }

    setupMotherNavigation();
    loadUserProfile();

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await logoutUser();
        window.location.href = 'login.html';
    });

    document.getElementById('chatForm')?.addEventListener('submit', handleSendMessage);

    await loadMentorsList();
});

function setupMotherNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            const target = document.getElementById(this.getAttribute('data-tab') + 'Tab');
            if (target) target.classList.add('active');
            if (this.getAttribute('data-tab') === 'content') loadArticles('all');
        });
    });
}

async function loadMentorsList() {
    const list = document.getElementById('mentorList');
    if (!list) return;

    list.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:0.5rem">Loading mentors...</p>';
    const mentors = await getActiveMentors();

    if (mentors.length === 0) {
        list.innerHTML = '<p class="empty-state-small">No mentors available at the moment. Please check back soon.</p>';
        return;
    }

    list.innerHTML = mentors.map(m => `
        <div class="mentor-item" data-mentor-id="${m.id}"
             onclick='selectMentor(${m.id}, ${JSON.stringify(m)})'>
            <div class="mentor-avatar">${m.username.charAt(0).toUpperCase()}</div>
            <div class="mentor-details">
                <span class="mentor-name">${escapeHtml(m.username)}</span>
                <span class="mentor-specialty">${escapeHtml(m.specialty)}</span>
            </div>
            <div class="mentor-status-dot"></div>
        </div>`).join('');
}

async function selectMentor(mentorId, mentor) {
    selectedMentor = mentor;

    document.querySelectorAll('#mentorList .mentor-item').forEach(el => el.classList.remove('selected'));
    document.querySelector(`#mentorList [data-mentor-id="${mentorId}"]`)?.classList.add('selected');

    document.getElementById('chatHeader').innerHTML = `
        <div class="chat-header-info">
            <div class="chat-avatar">${mentor.username.charAt(0).toUpperCase()}</div>
            <div>
                <strong>${escapeHtml(mentor.username)}</strong>
                <span class="chat-specialty">${escapeHtml(mentor.specialty)}</span>
            </div>
        </div>`;

    document.getElementById('chatForm').style.display = 'flex';
    await loadChatHistory(mentorId);
}

async function loadChatHistory(mentorId) {
    const container = document.getElementById('chatMessages');
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Loading messages...</p>';

    const messages = await getChatMessages(mentorId);

    if (messages.length === 0) {
        container.innerHTML = `
            <div class="chat-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p>Start your anonymous conversation with ${escapeHtml(selectedMentor.username)}.</p>
                <p style="font-size:0.85rem;color:var(--text-muted)">Your identity is protected.</p>
            </div>`;
        return;
    }

    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.sender === 'user' ? 'sent' : 'received'}">
            <div class="message-text">${escapeHtml(msg.text)}</div>
            <span class="message-time">${formatTime(msg.created_at)}</span>
        </div>`).join('');
    container.scrollTop = container.scrollHeight;
}

async function handleSendMessage(e) {
    e.preventDefault();
    if (!selectedMentor) return;
    const input = document.getElementById('messageInput');
    const text  = input.value.trim();
    if (!text) return;

    input.value = '';
    try {
        await sendMessage(selectedMentor.id, text);
        await loadChatHistory(selectedMentor.id);
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

function loadUserProfile() {
    const user = getCurrentUser();
    if (!user) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('profileInitial',  user.username.charAt(0).toUpperCase());
    set('profileUsername', user.username);
    set('profileRole',     'Young Mother');
    set('accountType',     'Young Mother');
    set('memberSince',     formatDate(user.createdAt));
}
