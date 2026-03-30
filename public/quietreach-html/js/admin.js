document.addEventListener('DOMContentLoaded', async function () {
    if (!requireAdmin()) return;
    setupAdminNavigation();
    const user = getCurrentUser();
    const nameEl = document.getElementById('adminUsername');
    if (nameEl) nameEl.textContent = user.username;
    document.getElementById('logoutBtn')?.addEventListener('click', async () => { await logoutUser(); window.location.href = 'login-admin.html'; });
    document.getElementById('addMentorBtn')?.addEventListener('click', openAddMentorModal);
    document.getElementById('addMentorForm')?.addEventListener('submit', handleAddMentor);
    document.getElementById('addMentorModal')?.addEventListener('click', function (e) { if (e.target === this) closeAddMentorModal(); });
    await refreshAll();
});

async function refreshAll() {
    await Promise.all([loadOverviewStats(), loadPendingMentors(), loadMentorsTable(), loadUsersTable()]);
    updatePendingBadge();
}

function setupAdminNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.getElementById(this.getAttribute('data-tab') + 'Tab')?.classList.add('active');
        });
    });
}

async function updatePendingBadge() {
    const mentors = await getAllMentors();
    const count = mentors.filter(m => m.status === 'pending').length;
    const badge = document.getElementById('pendingCount');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

async function loadOverviewStats() {
    const stats = await getPlatformStats();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('totalUsers', stats.totalUsers); set('totalMothers', stats.totalMothers);
    set('totalMentors', stats.totalMentors); set('pendingMentors', stats.pendingMentors);
}

async function loadPendingMentors() {
    const list = document.getElementById('pendingList'); if (!list) return;
    const pending = (await getAllMentors()).filter(m => m.status === 'pending');
    if (pending.length === 0) { list.innerHTML = `<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg><p>No pending applications</p></div>`; return; }
    list.innerHTML = `<table class="data-table"><thead><tr><th>Username</th><th>Specialty</th><th>Applied On</th><th>Actions</th></tr></thead><tbody>${pending.map(m => `<tr><td><strong>${escapeHtml(m.username)}</strong></td><td>${escapeHtml(m.specialty)}</td><td>${formatDate(m.created_at)}</td><td><div class="action-btns"><button class="btn btn-success" onclick="approveMentor(${m.id})">Approve</button><button class="btn btn-danger" onclick="rejectMentor(${m.id})">Reject</button></div></td></tr>`).join('')}</tbody></table>`;
}

async function loadMentorsTable() {
    const list = document.getElementById('mentorsList'); if (!list) return;
    const approved = (await getAllMentors()).filter(m => m.status === 'active' || m.status === 'inactive');
    if (approved.length === 0) { list.innerHTML = `<div class="empty-state"><p>No mentors yet.</p></div>`; return; }
    list.innerHTML = `<table class="data-table"><thead><tr><th>Username</th><th>Specialty</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>${approved.map(m => `<tr><td><strong>${escapeHtml(m.username)}</strong></td><td>${escapeHtml(m.specialty)}</td><td><span class="status-badge ${m.status}">${m.status}</span></td><td>${formatDate(m.created_at)}</td><td><div class="action-btns">${m.status === 'active' ? `<button class="btn btn-outline" onclick="toggleMentorStatus(${m.id},'inactive')">Deactivate</button>` : `<button class="btn btn-primary" onclick="toggleMentorStatus(${m.id},'active')">Activate</button>`}<button class="btn btn-danger" onclick="removeMentor(${m.id})">Remove</button></div></td></tr>`).join('')}</tbody></table>`;
}

async function loadUsersTable() {
    const list = document.getElementById('usersList'); if (!list) return;
    const users = await getAllUsers();
    if (users.length === 0) { list.innerHTML = `<div class="empty-state"><p>No registered users yet.</p></div>`; return; }
    list.innerHTML = `<table class="data-table"><thead><tr><th>Username</th><th>Role</th><th>Joined</th></tr></thead><tbody>${users.map(u => `<tr><td><strong>${escapeHtml(u.username)}</strong></td><td><span class="status-badge ${u.role}">${u.role === 'mother' ? 'Young Mother' : 'Mentor'}</span></td><td>${formatDate(u.created_at)}</td></tr>`).join('')}</tbody></table>`;
}

async function approveMentor(id) { try { await updateMentorStatus(id, 'active'); await refreshAll(); showNotification('Mentor approved. They can now log in.', 'success'); } catch (err) { showNotification(err.message, 'error'); } }
async function rejectMentor(id)  { if (!confirm('Reject this application?')) return; try { await updateMentorStatus(id, 'rejected'); await refreshAll(); showNotification('Application rejected.', 'info'); } catch (err) { showNotification(err.message, 'error'); } }
async function toggleMentorStatus(id, status) { try { await updateMentorStatus(id, status); await loadMentorsTable(); await loadOverviewStats(); showNotification(`Mentor ${status === 'active' ? 'activated' : 'deactivated'}.`, 'success'); } catch (err) { showNotification(err.message, 'error'); } }
async function removeMentor(id)  { if (!confirm('Remove this mentor? This cannot be undone.')) return; try { await deleteMentor(id); await refreshAll(); showNotification('Mentor removed.', 'info'); } catch (err) { showNotification(err.message, 'error'); } }

function openAddMentorModal()  { document.getElementById('addMentorModal').classList.add('show'); }
function closeAddMentorModal() { document.getElementById('addMentorModal').classList.remove('show'); document.getElementById('addMentorForm').reset(); }

async function handleAddMentor(e) {
    e.preventDefault();
    try {
        await addMentor(document.getElementById('mentorUsername').value.trim(), document.getElementById('mentorPassword').value, document.getElementById('mentorSpecialty').value);
        closeAddMentorModal(); await refreshAll();
        showNotification('Mentor added. They can log in immediately.', 'success');
    } catch (err) { alert(err.message); }
}
