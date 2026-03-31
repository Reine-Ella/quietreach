/* ========================================
   QuietReach - Resource Articles Logic
   ======================================== */

let currentCategory = 'all';

function loadArticles(category) {
    if (category !== undefined) currentCategory = category;

    const list = document.getElementById('articlesList');
    if (!list) return;

    const filtered = currentCategory === 'all'
        ? ARTICLES
        : ARTICLES.filter(a => a.category === currentCategory);

    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-state"><p>No articles in this category.</p></div>`;
        return;
    }

    list.innerHTML = filtered.map(a => `
        <div class="article-card" onclick="openArticle(${a.id})">
            <span class="article-category">${formatCategory(a.category)}</span>
            <h3>${a.title}</h3>
            <p>${a.summary}</p>
            <div class="article-meta">${a.readTime}</div>
        </div>
    `).join('');
}

function formatCategory(category) {
    if (!category) return '';
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function openArticle(articleId) {
    const article = ARTICLES.find(a => a.id === articleId);
    if (!article) return;

    const modal = document.getElementById('articleModal');
    const content = document.getElementById('articleContent');

    if (!modal || !content) return;

    content.innerHTML = article.content;
    modal.classList.add('show');
}

function closeArticleModal() {
    const modal = document.getElementById('articleModal');
    if (modal) modal.classList.remove('show');
}

document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-category') || 'all';
            loadArticles(category);
        });
    });

    const modal = document.getElementById('articleModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeArticleModal();
            }
        });
    }

    loadArticles('all');
});
