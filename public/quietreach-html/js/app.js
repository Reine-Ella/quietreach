/* ========================================
   QuietReach - API Data Layer
   ======================================== */

const API = '/api';

function getCurrentUser() {
    const data = localStorage.getItem('qr_user');
    return data ? JSON.parse(data) : null;
}
function setCurrentUser(user) { localStorage.setItem('qr_user', JSON.stringify(user)); }
function clearCurrentUser()   { localStorage.removeItem('qr_user'); }
function isLoggedIn()         { return getCurrentUser() !== null; }

function requireAuth() {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return false; }
    return true;
}
function requireAdmin() {
    const u = getCurrentUser();
    if (!u || u.role !== 'admin') { window.location.href = 'login-admin.html'; return false; }
    return true;
}
function requireMentor() {
    const u = getCurrentUser();
    if (!u || u.role !== 'mentor') { window.location.href = 'login-mentor.html'; return false; }
    return true;
}
function requireMother() {
    const u = getCurrentUser();
    if (!u || u.role !== 'mother') { window.location.href = 'login-mother.html'; return false; }
    return true;
}
function redirectByRole(role) {
    if (role === 'admin')       window.location.href = 'admin.html';
    else if (role === 'mentor') window.location.href = 'dashboard-mentor.html';
    else                        window.location.href = 'dashboard-mother.html';
}

async function apiFetch(method, path, body) {
    const opts = { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include' };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(API + path, opts);
    if (res.status === 401) { clearCurrentUser(); window.location.href = 'login.html'; return null; }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
    return data;
}

async function loginUser(username, password, role)            { return apiFetch('POST', '/auth/login',    { username, password, role }); }
async function registerUser(username, password, role, spec)   { return apiFetch('POST', '/auth/register', { username, password, role, specialty: spec }); }
async function logoutUser()                                    { await apiFetch('POST', '/auth/logout'); clearCurrentUser(); }

async function getActiveMentors()          { const d = await apiFetch('GET', '/mentors/active');  return d ? d.mentors : []; }
async function getAllMentors()              { const d = await apiFetch('GET', '/mentors');          return d ? d.mentors : []; }
async function addMentor(u, p, s)          { return apiFetch('POST',   '/mentors',           { username: u, password: p, specialty: s }); }
async function updateMentorStatus(id, st)  { return apiFetch('PATCH',  `/mentors/${id}/status`, { status: st }); }
async function deleteMentor(id)            { return apiFetch('DELETE', `/mentors/${id}`); }

async function getChatMessages(mentorId)   { const d = await apiFetch('GET', `/chats/with/${mentorId}`);            return d ? d.messages : []; }
async function sendMessage(mentorId, text) { return apiFetch('POST', `/chats/with/${mentorId}`, { text }); }

async function getMentorConversations()        { const d = await apiFetch('GET', '/chats/conversations');                return d ? d.conversations : []; }
async function getConversationMessages(mId)    { const d = await apiFetch('GET', `/chats/conversations/${mId}`);        return d ? d.messages : []; }
async function sendReply(motherId, text)        { return apiFetch('POST',  `/chats/conversations/${motherId}`, { text }); }
async function markConversationRead(motherId)   { return apiFetch('PATCH', `/chats/conversations/${motherId}/read`); }

async function getAllUsers()      { const d = await apiFetch('GET', '/users');  return d ? d.users : []; }
async function getPlatformStats() { const d = await apiFetch('GET', '/stats');  return d || { totalUsers: 0, totalMothers: 0, totalMentors: 0, pendingMentors: 0 }; }

const ARTICLES = [
    { id: 1, title: 'Understanding Your Emotions as a Young Mother', category: 'mental-health', summary: 'Learn healthy ways to process the complex emotions that come with early motherhood.', readTime: '5 min read',
      content: `<h2>Understanding Your Emotions as a Young Mother</h2><p>Becoming a mother at a young age brings a unique set of emotional challenges. It is completely normal to feel overwhelmed, scared, or uncertain about the future.</p><h3>Common Emotions You May Experience</h3><ul><li><strong>Fear and Anxiety:</strong> Worrying about whether you are doing things right is natural.</li><li><strong>Isolation:</strong> You might feel different from your peers or misunderstood.</li><li><strong>Joy and Love:</strong> Despite challenges, many young mothers feel an overwhelming love for their child.</li><li><strong>Guilt:</strong> You may feel guilty about various aspects of your situation - this is normal.</li></ul><h3>Healthy Coping Strategies</h3><ul><li>Talk to someone you trust - a mentor, family member, or friend</li><li>Practice deep breathing when feeling overwhelmed</li><li>Take small breaks when possible</li><li>Celebrate small victories</li><li>Remember that asking for help is a sign of strength</li></ul>` },
    { id: 2, title: 'Basic Infant Care: A Beginner Guide', category: 'parenting', summary: 'Essential tips for feeding, bathing, and caring for your newborn baby.', readTime: '7 min read',
      content: `<h2>Basic Infant Care: A Beginner Guide</h2><p>Caring for a newborn can feel overwhelming at first, but with time and practice, you will become more confident.</p><h3>Feeding Your Baby</h3><ul><li>Newborns typically need to eat every 2-3 hours</li><li>Look for hunger cues: rooting, sucking on hands, crying</li><li>Burp your baby during and after feeding</li></ul><h3>Safe Sleep Practices</h3><ul><li>Always place baby on their back to sleep</li><li>Use a firm, flat sleep surface</li><li>Keep soft items out of the sleep area</li></ul>` },
    { id: 3, title: 'Continuing Your Education as a Teen Mom', category: 'education', summary: 'Practical strategies for balancing school and motherhood successfully.', readTime: '6 min read',
      content: `<h2>Continuing Your Education as a Teen Mom</h2><p>Your education is valuable and can open doors for both you and your child future.</p><h3>Practical Tips</h3><ul><li><strong>Create a schedule:</strong> Plan study time around your baby routine</li><li><strong>Build a support network:</strong> Family, friends, or community members who can help with childcare</li><li><strong>Talk to your teachers:</strong> Let them know your situation; many will be supportive</li></ul>` },
    { id: 4, title: 'Building a Budget on Limited Income', category: 'life-skills', summary: 'Learn how to manage your money wisely and provide for your family.', readTime: '5 min read',
      content: `<h2>Building a Budget on Limited Income</h2><p>Managing money can be challenging, especially as a young mother with limited resources.</p><h3>Creating a Simple Budget</h3><ol><li><strong>Track your income:</strong> Know exactly how much money you have coming in</li><li><strong>List necessary expenses:</strong> Rent, food, diapers, utilities</li><li><strong>Prioritize needs over wants:</strong> Focus on essentials first</li></ol>` },
    { id: 5, title: 'Self-Care is Not Selfish', category: 'mental-health', summary: 'Why taking care of yourself makes you a better mother.', readTime: '4 min read',
      content: `<h2>Self-Care is Not Selfish</h2><p>As a young mother, you might feel guilty about taking time for yourself. But self-care is essential.</p><h3>Simple Self-Care Ideas</h3><ul><li><strong>Rest when baby rests:</strong> Sleep is precious</li><li><strong>Stay hydrated:</strong> Keep water nearby</li><li><strong>Take short breaks:</strong> Even 5 minutes of quiet can help</li><li><strong>Connect with others:</strong> Talk to friends, family, or mentors</li></ul>` },
    { id: 6, title: 'Building Healthy Relationships', category: 'life-skills', summary: 'Navigate friendships, family dynamics, and partnerships as a young mother.', readTime: '5 min read',
      content: `<h2>Building Healthy Relationships</h2><p>Relationships often change when you become a mother. Learning to build and maintain healthy relationships is important.</p><h3>Signs of a Healthy Relationship</h3><ul><li>Mutual respect and trust</li><li>Open and honest communication</li><li>Support without judgment</li><li>Respect for boundaries</li></ul>` }
];

function formatDate(s)  { if (!s) return 'Unknown'; const d = new Date(s); return isNaN(d) ? s : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); }
function formatTime(s)  { if (!s) return ''; return new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function formatTimeShort(s) { if (!s) return ''; const d = new Date(s), now = new Date(), diff = Math.floor((now - d) / 86400000); return diff === 0 ? formatTime(s) : diff === 1 ? 'Yesterday' : d.toLocaleDateString(); }
function truncateText(t, max) { if (!t) return ''; return t.length > max ? t.substring(0, max) + '...' : t; }
function getTodayDate() { return new Date().toISOString().split('T')[0]; }
function showNotification(msg, type) {
    const el = document.createElement('div');
    el.className = `notification ${type}`;
    el.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()">&times;</button>`;
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentElement) el.remove(); }, 3500);
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text || ''));
    return div.innerHTML;
}
