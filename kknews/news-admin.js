import { dbOperations } from '../firebase-config.js';

// News Management
async function loadNews() {
    try {
        const news = await dbOperations.getAll('news');
        const newsList = document.getElementById('newsList');
        
        newsList.innerHTML = news.map(article => `
            <div class="item-card">
                <div class="item-header">
                    <div>
                        <div class="item-title">${article.title}</div>
                        <div>Category: ${article.category} | Author: ${article.author || 'Unknown'} | ${new Date(article.createdAt?.seconds * 1000).toLocaleDateString()}</div>
                        <div style="margin-top: 5px; font-size: 0.9em; color: #ccc;">${article.excerpt || ''}</div>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="editNews('${article.id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteNews('${article.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading news:', error);
    }
}

function showAddNewsForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add News Article</h2>
        <form id="newsForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="newsTitle" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="newsCategory" required>
                    <option value="stars">Stars</option>
                    <option value="trending">Trending</option>
                    <option value="gossip">Gossip</option>
                    <option value="reports">Reports</option>
                </select>
            </div>
            <div class="form-group">
                <label>Content</label>
                <textarea id="newsContent" rows="6" required></textarea>
            </div>
            <div class="form-group">
                <label>Author</label>
                <input type="text" id="newsAuthor" value="KKNews Team" required>
            </div>
            <div class="form-group">
                <label>Image URL</label>
                <input type="url" id="newsImage">
            </div>
            <button type="submit" class="form-submit">Add Article</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('newsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('newsTitle').value;
        const category = document.getElementById('newsCategory').value;
        const content = document.getElementById('newsContent').value;
        const author = document.getElementById('newsAuthor').value;
        const image = document.getElementById('newsImage').value;
        
        try {
            await dbOperations.add('news', {
                title,
                category,
                content,
                author,
                image,
                excerpt: content.substring(0, 150) + '...',
                views: 0,
                createdAt: new Date(),
                date: new Date()
            });
            closeModal();
            loadNews();
        } catch (error) {
            console.error('Error adding news:', error);
        }
    });
}

async function deleteNews(id) {
    if (confirm('Are you sure you want to delete this article?')) {
        try {
            await dbOperations.delete('news', id);
            loadNews();
        } catch (error) {
            console.error('Error deleting news:', error);
        }
    }
}

async function editNews(id) {
    try {
        const news = await dbOperations.getAll('news');
        const article = news.find(n => n.id === id);
        if (article) {
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <h2>Edit News Article</h2>
                <form id="editNewsForm">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="editNewsTitle" value="${article.title}" required>
                    </div>
                    <div class="form-group">
                        <label>Category</label>
                        <select id="editNewsCategory" required>
                            <option value="stars" ${article.category === 'stars' ? 'selected' : ''}>Stars</option>
                            <option value="trending" ${article.category === 'trending' ? 'selected' : ''}>Trending</option>
                            <option value="gossip" ${article.category === 'gossip' ? 'selected' : ''}>Gossip</option>
                            <option value="reports" ${article.category === 'reports' ? 'selected' : ''}>Reports</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Content</label>
                        <textarea id="editNewsContent" rows="8" required>${article.content}</textarea>
                        <small style="color: #ccc; display: block; margin-top: 5px;">
                            Use &lt;embed&gt;URL&lt;/embed&gt; for media, &lt;a href="URL"&gt;text&lt;/a&gt; for links
                        </small>
                    </div>
                    <div class="form-group">
                        <label>Featured</label>
                        <input type="checkbox" id="editNewsFeatured" ${article.featured ? 'checked' : ''}>
                    </div>
                    <div class="form-group">
                        <label>Related News IDs (max 4, comma separated)</label>
                        <input type="text" id="editRelatedNews" value="${article.relatedNews ? article.relatedNews.join(',') : ''}" placeholder="1,2,3,4">
                        <small style="color: #888;">Maximum 4 related articles</small>
                    </div>
                    <button type="submit" class="form-submit">Update Article</button>
                </form>
            `;
            
            document.getElementById('modal').style.display = 'block';
            
            document.getElementById('editNewsForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const title = document.getElementById('editNewsTitle').value;
                const category = document.getElementById('editNewsCategory').value;
                const content = document.getElementById('editNewsContent').value;
                const featured = document.getElementById('editNewsFeatured').checked;
                const relatedNewsInput = document.getElementById('editRelatedNews').value;
                
                let relatedNews = [];
                if (relatedNewsInput.trim()) {
                    relatedNews = relatedNewsInput.split(',').map(id => id.trim()).filter(id => id).slice(0, 4);
                }
                
                await dbOperations.update('news', id, {
                    title,
                    category,
                    content,
                    featured,
                    relatedNews,
                    excerpt: content.substring(0, 150) + '...'
                });
                closeModal();
                loadNews();
                alert('✅ News updated!');
            });
        }
    } catch (error) {
        console.error('Error editing news:', error);
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Make functions global
window.showAddNewsForm = showAddNewsForm;
window.editNews = editNews;
window.deleteNews = deleteNews;
window.closeModal = closeModal;

// Load news on page load
document.addEventListener('DOMContentLoaded', loadNews);