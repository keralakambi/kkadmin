// supabaseOperations is available globally from supabase-config.js

let images = [];

document.addEventListener('DOMContentLoaded', () => {
    loadImages();
});

function goBack() {
    window.location.href = '../index.html';
}

async function loadImages() {
    try {
        // Wait a bit for supabase to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        images = await supabaseOperations.getImages();
        displayImages();
        updateStats();
    } catch (error) {
        console.error('Error loading images:', error);
        document.getElementById('imagesList').innerHTML = `
            <div class="error-message">
                <h3>Database Setup Required</h3>
                <p>Please create the following table in your Supabase dashboard:</p>
                <pre>CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  photographer TEXT DEFAULT 'Kerala Kambi',
  description TEXT,
  tags TEXT,
  about_photographer TEXT,
  img_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);</pre>
            </div>
        `;
    }
}

function displayImages() {
    const imagesList = document.getElementById('imagesList');
    
    if (images.length === 0) {
        imagesList.innerHTML = '<div class="no-items">No images found</div>';
        return;
    }

    imagesList.innerHTML = images.map(image => `
        <div class="item-card">
            <div class="video-info">
                <img src="${image.img_url}" alt="${image.title}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none'">
                <div class="video-details">
                    <h4>${image.title}</h4>
                    <p>Photographer: ${image.photographer}</p>
                    <p>Tags: ${Array.isArray(image.tags) ? image.tags.join(', ') : (image.tags || 'No tags')}</p>
                    <p>Uploaded: ${new Date(image.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="edit-btn" data-id="${image.id}">Edit</button>
                <button class="view-btn" data-id="${image.id}">View</button>
                <button class="delete-btn" data-id="${image.id}">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editImage(btn.dataset.id));
    });
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewImage(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteImage(btn.dataset.id));
    });
}

function updateStats() {
    document.getElementById('totalImages').textContent = images.length;
}

function showAddImageForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add New Image</h2>
        <form id="imageForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="imageTitle" required>
            </div>
            <div class="form-group">
                <label>Photographer</label>
                <input type="text" id="imagePhotographer" value="Kerala Kambi" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="imageDescription" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Tags</label>
                <input type="text" id="imageTags" placeholder="tag1, tag2, tag3">
            </div>
            <div class="form-group">
                <label>About Photographer</label>
                <textarea id="imageAboutPhotographer" rows="2"></textarea>
            </div>
            <div class="form-group">
                <label>Image URL</label>
                <input type="url" id="imageUrl" required>
            </div>
            <button type="submit" class="form-submit">Add Image</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('imageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const imageData = {
            title: document.getElementById('imageTitle').value,
            photographer: document.getElementById('imagePhotographer').value,
            description: document.getElementById('imageDescription').value,
            tags: document.getElementById('imageTags').value,
            about_photographer: document.getElementById('imageAboutPhotographer').value,
            img_url: document.getElementById('imageUrl').value
        };
        
        try {
            await supabaseOperations.addImage(imageData);
            closeModal();
            loadImages();
            alert('Image added successfully!');
        } catch (error) {
            console.error('Error adding image:', error);
            alert('Error adding image. Please try again.');
        }
    });
}

async function editImage(id) {
    const image = images.find(i => i.id === id);
    if (!image) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Edit Image</h2>
        <form id="editImageForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="editImageTitle" value="${image.title}" required>
            </div>
            <div class="form-group">
                <label>Photographer</label>
                <input type="text" id="editImagePhotographer" value="${image.photographer}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="editImageDescription" rows="3">${image.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Tags</label>
                <input type="text" id="editImageTags" value="${Array.isArray(image.tags) ? image.tags.join(', ') : (image.tags || '')}">
            </div>
            <div class="form-group">
                <label>About Photographer</label>
                <textarea id="editImageAboutPhotographer" rows="2">${image.about_photographer || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Image URL</label>
                <input type="url" id="editImageUrl" value="${image.img_url}" required>
            </div>
            <button type="submit" class="form-submit">Update Image</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('editImageForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedData = {
            title: document.getElementById('editImageTitle').value,
            photographer: document.getElementById('editImagePhotographer').value,
            description: document.getElementById('editImageDescription').value,
            tags: document.getElementById('editImageTags').value,
            about_photographer: document.getElementById('editImageAboutPhotographer').value,
            img_url: document.getElementById('editImageUrl').value,
            updated_at: new Date().toISOString()
        };
        
        try {
            await supabaseOperations.updateImage(id, updatedData);
            closeModal();
            loadImages();
            alert('Image updated successfully!');
        } catch (error) {
            console.error('Error updating image:', error);
            alert('Error updating image. Please try again.');
        }
    });
}

async function deleteImage(id) {
    const image = images.find(i => i.id === id);
    if (!image) return;
    
    if (confirm(`Are you sure you want to delete "${image.title}"?`)) {
        try {
            await supabaseOperations.deleteImage(id);
            loadImages();
            alert('Image deleted successfully!');
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Error deleting image. Please try again.');
        }
    }
}

function viewImage(id) {
    const image = images.find(i => i.id === id);
    if (!image) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>${image.title}</h2>
        <div class="image-viewer">
            <img src="${image.img_url}" alt="${image.title}" style="width: 100%; max-width: 600px;">
            <div class="image-info-detailed">
                <p><strong>Photographer:</strong> ${image.photographer}</p>
                <p><strong>Description:</strong> ${image.description || 'No description'}</p>
                <p><strong>Tags:</strong> ${Array.isArray(image.tags) ? image.tags.join(', ') : (image.tags || 'No tags')}</p>
                <p><strong>About Photographer:</strong> ${image.about_photographer || 'No info'}</p>
                <p><strong>Uploaded:</strong> ${new Date(image.created_at).toLocaleString()}</p>
                <p><strong>Last Updated:</strong> ${image.updated_at ? new Date(image.updated_at).toLocaleString() : 'Never'}</p>
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function refreshImages() {
    loadImages();
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
window.showAddImageForm = showAddImageForm;
window.editImage = editImage;
window.deleteImage = deleteImage;
window.viewImage = viewImage;
window.refreshImages = refreshImages;
window.closeModal = closeModal;