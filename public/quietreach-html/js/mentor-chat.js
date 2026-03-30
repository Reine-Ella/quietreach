/* ========================================
   QuietReach - Mentor Dashboard Logic
   ======================================== */

let selectedMother = null;

document.addEventListener('DOMContentLoaded', async function () {
    if (!requireAuth()) return;
    const user = getCurrentUser();
    if (user.role !== 'mentor') {
        window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard-mother.html';
        return;
    }

    setupMentorNavigation();
    loadMentorProfile();

    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
        await logoutUser();
        window.location.href = 'login.html';
    });

    document.getElementById('mentorChatForm')?.addEventListener('submit', handleMentorSendMessage);

    await loadMentorConversationsView();
});

function setupMentorNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            const target = document.getElementById(this.getAttribute('data-tab') + 'Tab');
            if (target) target.classList.add('active');
        });
    });
}

async function loadMentorConversationsView() {
    const list = document.getElementById('conversationsList');
    if (!list) return;

    list.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:0.5rem">Loading conversations...</p>';
    const conversations = await getMentorConversations();

    const totalEl  = document.getElementById('totalConversations');
    const unreadEl = document.getElementById('unreadMessages');
    if (totalEl)  totalEl.textContent  = conversations.length;
    if (unreadEl) unreadEl.textContent = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    if (conversations.length === 0) {
        list.innerHTML = `
            <div class="empty-conversations">
                <div class="empty-icon">💬</div>
                <p>No messages yet</p>
                <p class="empty-hint">When young mothers message you, they will appear here.</p>
            </div>`;
        return;
    }

    list.innerHTML = conversations.map(conv => `
        <div class="mentor-item conversation-item ${conv.unread_count > 0 ? 'has-unread' : ''}"
             data-mother-id="${conv.mother_id}"
             onclick="selectConversation(${conv.mother_id}, '${escapeHtml(conv.mother_username)}')">
            <div class="conversation-header">
                <div class="conv-avatar">${conv.mother_username.charAt(0).toUpperCase()}</div>
                <div class="conv-info">
                    <span class="mentor-name">${escapeHtml(conv.mother_username)}</span>
                    ${conv.unread_count > 0 ? `<span class="unread-badge">${conv.unread_count}</span>` : ''}
                </div>
            </div>
            <span class="last-message">${escapeHtml(truncateText(conv.last_message, 45))}</span>
            <span class="message-time-small">${formatTimeShort(conv.last_message_time)}</span>
        </div>`).join('');
}

async function selectConversation(motherId, motherUsername) {
    selectedMother = { id: motherId, username: motherUsername };

    await markConversationRead(motherId);

    document.querySelectorAll('#conversationsList .mentor-item').forEach(el => el.classList.remove('selected'));
    const item = document.querySelector(`#conversationsList [data-mother-id="${motherId}"]`);
    if (item) {
        item.classList.add('selected');
        item.classList.remove('has-unread');
        item.querySelector('.unread-badge')?.remove();
    }

    document.getElementById('mentorChatHeader').innerHTML = `
        <div class="chat-header-info">
            <div class="chat-avatar">${motherUsername.charAt(0).toUpperCase()}</div>
            <div>
                <strong>${escapeHtml(motherUsername)}</strong>
                <span class="chat-specialty">Anonymous Young Mother</span>
            </div>
        </div>`;

    document.getElementById('mentorChatForm').style.display = 'flex';
    await loadMentorChatHistory(motherId);
}

async function loadMentorChatHistory(motherId) {
    const container = document.getElementById('mentorChatMessages');
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Loading messages...</p>';

    const messages = await getConversationMessages(motherId);

    if (messages.length === 0) {
        container.innerHTML = `<div class="chat-placeholder"><p>No messages in this conversation yet.</p></div>`;
        return;
    }

    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.sender === 'mentor' ? 'sent' : 'received'}">
            <div class="message-text">${escapeHtml(msg.text)}</div>
            <span class="message-time">${formatTime(msg.created_at)}</span>
        </div>`).join('');
    container.scrollTop = container.scrollHeight;
}

async function handleMentorSendMessage(e) {
    e.preventDefault();
    if (!selectedMother) return;
    const input = document.getElementById('mentorMessageInput');
    const text  = input.value.trim();
    if (!text) return;

    input.value = '';
    try {
        await sendReply(selectedMother.id, text);
        await loadMentorChatHistory(selectedMother.id);
    } catch (err) {
        showNotification(err.message, 'error');
    }
}

function loadMentorProfile() {
    const user = getCurrentUser();
    if (!user) return;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('profileInitial',         user.username.charAt(0).toUpperCase());
    set('profileUsername',        user.username);
    set('profileRole',            'Mentor');
    set('mentorSpecialtyDisplay', user.specialty || '-');
    set('accountType',            'Mentor');
    set('memberSince',            formatDate(user.createdAt));
    const welcome = document.getElementById('mentorWelcome');
    if (welcome) welcome.textContent = 'Mentor: ' + user.username;
}
