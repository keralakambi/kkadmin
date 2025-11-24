// supabaseOperations is available globally from supabase-config.js

let stories = [];

document.addEventListener('DOMContentLoaded', () => {
    loadStories();
});

function goBack() {
    window.location.href = '../index.html';
}

async function loadStories() {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        stories = await supabaseOperations.getStories();
        displayStories();
        updateStats();
    } catch (error) {
        console.error('Error loading stories:', error);
        document.getElementById('storiesList').innerHTML = `
            <div class="error-message">
                <h3>Database Setup Required</h3>
                <p>Please create the following tables in your Supabase dashboard:</p>
                <pre>CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT CHECK (category IN ('novel', 'stories', 'cartoon')),
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE TABLE story_pages (
  id SERIAL PRIMARY KEY,
  story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  link_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);</pre>
            </div>
        `;
    }
}

function displayStories() {
    const storiesList = document.getElementById('storiesList');
    
    if (stories.length === 0) {
        storiesList.innerHTML = '<div class="no-items">No stories found</div>';
        return;
    }

    storiesList.innerHTML = stories.map(story => `
        <div class="item-card">
            <div class="video-info">
                ${story.thumbnail_url ? 
                    `<img src="${story.thumbnail_url}" alt="${story.title}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none'">` : 
                    `<div style="width: 100px; height: 60px; background: #333; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px;">No Thumbnail</div>`
                }
                <div class="video-details">
                    <h4>${story.title}</h4>
                    <p>Author: ${story.author}</p>
                    <p>Category: ${story.category}</p>
                    <p>Created: ${new Date(story.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="edit-btn" data-id="${story.id}">Edit</button>
                <button class="view-btn" data-id="${story.id}">View</button>
                <button class="pages-btn" data-id="${story.id}">Pages</button>
                <button class="delete-btn" data-id="${story.id}">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editStory(btn.dataset.id));
    });
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewStory(btn.dataset.id));
    });
    document.querySelectorAll('.pages-btn').forEach(btn => {
        btn.addEventListener('click', () => managePages(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteStory(btn.dataset.id));
    });
}

function updateStats() {
    document.getElementById('totalStories').textContent = stories.length;
}

function showAddStoryForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add New Story</h2>
        <form id="storyForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="storyTitle" required>
            </div>
            <div class="form-group">
                <label>Author</label>
                <input type="text" id="storyAuthor" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="storyCategory" required>
                    <option value="novel">Novel</option>
                    <option value="stories">Stories</option>
                    <option value="cartoon">Cartoon</option>
                </select>
            </div>
            <div class="form-group">
                <label>Thumbnail URL</label>
                <input type="url" id="storyThumbnail">
            </div>
            <button type="submit" class="form-submit">Add Story</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('storyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const storyData = {
            title: document.getElementById('storyTitle').value,
            author: document.getElementById('storyAuthor').value,
            category: document.getElementById('storyCategory').value,
            thumbnail_url: document.getElementById('storyThumbnail').value
        };
        
        try {
            await supabaseOperations.addStory(storyData);
            closeModal();
            loadStories();
            alert('Story added successfully!');
        } catch (error) {
            console.error('Error adding story:', error);
            alert('Error adding story. Please try again.');
        }
    });
}

async function editStory(id) {
    const story = stories.find(s => s.id === id);
    if (!story) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Edit Story</h2>
        <form id="editStoryForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="editStoryTitle" value="${story.title}" required>
            </div>
            <div class="form-group">
                <label>Author</label>
                <input type="text" id="editStoryAuthor" value="${story.author}" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="editStoryCategory" required>
                    <option value="novel" ${story.category === 'novel' ? 'selected' : ''}>Novel</option>
                    <option value="stories" ${story.category === 'stories' ? 'selected' : ''}>Stories</option>
                    <option value="cartoon" ${story.category === 'cartoon' ? 'selected' : ''}>Cartoon</option>
                </select>
            </div>
            <div class="form-group">
                <label>Thumbnail URL</label>
                <input type="url" id="editStoryThumbnail" value="${story.thumbnail_url || ''}">
            </div>
            <button type="submit" class="form-submit">Update Story</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('editStoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedData = {
            title: document.getElementById('editStoryTitle').value,
            author: document.getElementById('editStoryAuthor').value,
            category: document.getElementById('editStoryCategory').value,
            thumbnail_url: document.getElementById('editStoryThumbnail').value,
            updated_at: new Date().toISOString()
        };
        
        try {
            await supabaseOperations.updateStory(id, updatedData);
            closeModal();
            loadStories();
            alert('Story updated successfully!');
        } catch (error) {
            console.error('Error updating story:', error);
            alert('Error updating story. Please try again.');
        }
    });
}

async function deleteStory(id) {
    const story = stories.find(s => s.id === id);
    if (!story) return;
    
    if (confirm(`Are you sure you want to delete "${story.title}"?`)) {
        try {
            await supabaseOperations.deleteStory(id);
            loadStories();
            alert('Story deleted successfully!');
        } catch (error) {
            console.error('Error deleting story:', error);
            alert('Error deleting story. Please try again.');
        }
    }
}

function viewStory(id) {
    const story = stories.find(s => s.id === id);
    if (!story) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>${story.title}</h2>
        <div class="story-viewer">
            ${story.thumbnail_url ? `<img src="${story.thumbnail_url}" alt="${story.title}" style="width: 100%; max-width: 300px;">` : ''}
            <div class="story-info-detailed">
                <p><strong>Author:</strong> ${story.author}</p>
                <p><strong>Category:</strong> ${story.category}</p>
                <p><strong>Created:</strong> ${new Date(story.created_at).toLocaleString()}</p>
                <p><strong>Last Updated:</strong> ${story.updated_at ? new Date(story.updated_at).toLocaleString() : 'Never'}</p>
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

async function managePages(storyId) {
    try {
        const pages = await supabaseOperations.getStoryPages(storyId);
        const story = stories.find(s => s.id === storyId);
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Manage Pages - ${story.title}</h2>
            <div class="pages-manager">
                <button onclick="showAddPageForm(${storyId})" class="add-btn">Add Page</button>
                <div class="pages-list">
                    ${pages.map(page => `
                        <div class="page-item">
                            <div class="page-info">
                                <strong>Page ${page.page_number}</strong>
                                <p>${page.content.substring(0, 100)}...</p>
                                ${page.link_url ? `<p>Link: ${page.link_url}</p>` : ''}
                            </div>
                            <div class="page-actions">
                                <button onclick="editPage(${page.id})" class="edit-btn">Edit</button>
                                <button onclick="deletePage(${page.id})" class="delete-btn">Delete</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.getElementById('modal').style.display = 'block';
    } catch (error) {
        console.error('Error loading pages:', error);
        alert('Error loading pages.');
    }
}

function showAddPageForm(storyId) {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add New Page</h2>
        <form id="pageForm">
            <div class="form-group">
                <label>Page Number</label>
                <input type="number" id="pageNumber" required>
            </div>
            <div class="form-group">
                <label>Content</label>
                <textarea id="pageContent" rows="6" required></textarea>
            </div>
            <div class="form-group">
                <label>Link URL (optional)</label>
                <input type="url" id="pageLinkUrl">
            </div>
            <button type="submit" class="form-submit">Add Page</button>
        </form>
    `;
    
    document.getElementById('pageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pageData = {
            story_id: storyId,
            page_number: parseInt(document.getElementById('pageNumber').value),
            content: document.getElementById('pageContent').value,
            link_url: document.getElementById('pageLinkUrl').value
        };
        
        try {
            await supabaseOperations.addStoryPage(pageData);
            managePages(storyId);
            alert('Page added successfully!');
        } catch (error) {
            console.error('Error adding page:', error);
            alert('Error adding page. Please try again.');
        }
    });
}

async function editPage(pageId) {
    try {
        const pages = await supabaseOperations.getStoryPages();
        const page = pages.find(p => p.id === pageId);
        if (!page) return;
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h2>Edit Page</h2>
            <form id="editPageForm">
                <div class="form-group">
                    <label>Page Number</label>
                    <input type="number" id="editPageNumber" value="${page.page_number}" required>
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea id="editPageContent" rows="6" required>${page.content}</textarea>
                </div>
                <div class="form-group">
                    <label>Link URL (optional)</label>
                    <input type="url" id="editPageLinkUrl" value="${page.link_url || ''}">
                </div>
                <button type="submit" class="form-submit">Update Page</button>
            </form>
        `;
        
        document.getElementById('editPageForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedData = {
                page_number: parseInt(document.getElementById('editPageNumber').value),
                content: document.getElementById('editPageContent').value,
                link_url: document.getElementById('editPageLinkUrl').value
            };
            
            try {
                await supabaseOperations.updateStoryPage(pageId, updatedData);
                managePages(page.story_id);
                alert('Page updated successfully!');
            } catch (error) {
                console.error('Error updating page:', error);
                alert('Error updating page. Please try again.');
            }
        });
    } catch (error) {
        console.error('Error loading page:', error);
        alert('Error loading page.');
    }
}

async function deletePage(pageId) {
    if (confirm('Are you sure you want to delete this page?')) {
        try {
            await supabaseOperations.deleteStoryPage(pageId);
            // Reload the current story's pages
            const currentStoryId = document.querySelector('.pages-manager button').onclick.toString().match(/\d+/)[0];
            managePages(parseInt(currentStoryId));
            alert('Page deleted successfully!');
        } catch (error) {
            console.error('Error deleting page:', error);
            alert('Error deleting page. Please try again.');
        }
    }
}

function refreshStories() {
    loadStories();
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

window.goBack = goBack;
window.showAddStoryForm = showAddStoryForm;
window.editStory = editStory;
window.deleteStory = deleteStory;
window.viewStory = viewStory;
window.managePages = managePages;
window.showAddPageForm = showAddPageForm;
window.editPage = editPage;
window.deletePage = deletePage;
window.refreshStories = refreshStories;
window.closeModal = closeModal;