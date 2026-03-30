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
        </div>`).join('');
    }        