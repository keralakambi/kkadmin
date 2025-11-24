import { dbOperations } from './firebase-config.js';

let videos = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
});

function goBack() {
    window.location.href = '../index.html';
}

async function loadVideos() {
    try {
        videos = await dbOperations.getAll('videos');
        displayVideos();
        updateStats();
    } catch (error) {
        console.error('Error loading videos:', error);
        document.getElementById('videosList').innerHTML = '<div class="error-message">Error loading videos</div>';
    }
}

function displayVideos() {
    const videosList = document.getElementById('videosList');
    
    if (videos.length === 0) {
        videosList.innerHTML = '<div class="no-items">No videos found</div>';
        return;
    }

    videosList.innerHTML = videos.map(video => `
        <div class="item-card">
            <div class="video-info">
                ${video.thumbnail_url && video.thumbnail_url !== '' && !video.thumbnail_url.includes('h.png') ? 
                    `<img class="video-preview" src="${video.thumbnail_url}" alt="${video.title}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 4px;" onerror="this.style.display='none'">` : 
                    `<div class="video-preview" style="width: 100px; height: 60px; background: #333; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px;">No Thumbnail</div>`
                }
                <div class="video-details">
                    <h4>${video.title}</h4>
                    <p>Website: ${video.website || 'N/A'} | Uploader: ${video.uploader_name || 'N/A'}</p>
                    <p>Category: ${video.category} | Rating: ${video.content_rating || 'N/A'}</p>
                    <p>Views: ${video.views || 0} | Likes: ${video.likes || 0}</p>
                    <p>Uploaded: ${new Date(video.created_at?.seconds * 1000 || Date.now()).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="edit-btn" onclick="editVideo('${video.id}')">Edit</button>
                <button class="view-btn" onclick="viewVideo('${video.id}')">View</button>
                <button class="delete-btn" onclick="deleteVideo('${video.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('totalVideos').textContent = videos.length;
    document.getElementById('totalViews').textContent = videos.reduce((sum, video) => sum + (video.views || 0), 0);
    document.getElementById('activeVideos').textContent = videos.filter(video => video.isActive !== false).length;
}

function showAddVideoForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add New Video</h2>
        <form id="videoForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="videoTitle" required>
            </div>
            <div class="form-group">
                <label>Website</label>
                <input type="text" id="videoWebsite" required>
            </div>
            <div class="form-group">
                <label>Uploader Name</label>
                <input type="text" id="videoUploader" value="kerala kambi" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="videoCategory" required>
                    <option value="adult" selected>Adult</option>
                    <option value="amateur">Amateur</option>
                    <option value="professional">Professional</option>
                    <option value="couples">Couples</option>
                    <option value="solo">Solo</option>
                    <option value="fetish">Fetish</option>
                    <option value="vintage">Vintage</option>
                </select>
            </div>
            <div class="form-group">
                <label>Content Rating</label>
                <select id="videoContentRating" required>
                    <option value="adult (explicit)" selected>Adult (Explicit)</option>
                    <option value="mature">Mature</option>
                    <option value="adult">Adult</option>
                </select>
            </div>
            <div class="form-group">
                <label>Tags (comma separated)</label>
                <input type="text" id="videoTags" placeholder="tag1, tag2, tag3">
            </div>
            <div class="form-group">
                <label>Video URL</label>
                <input type="url" id="videoUrl" required>
            </div>
            <div class="form-group">
                <label>Thumbnail URL</label>
                <input type="url" id="videoThumbnail">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="videoActive" checked>
                    Active
                </label>
            </div>
            <button type="submit" class="form-submit">Add Video</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('videoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('videoTitle').value;
        const website = document.getElementById('videoWebsite').value;
        const uploader = document.getElementById('videoUploader').value;
        const category = document.getElementById('videoCategory').value;
        const contentRating = document.getElementById('videoContentRating').value;
        const tags = document.getElementById('videoTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
        const videoUrl = document.getElementById('videoUrl').value;
        const thumbnail = document.getElementById('videoThumbnail').value;
        const isActive = document.getElementById('videoActive').checked;
        
        try {
            await dbOperations.add('videos', {
                title,
                website,
                uploader_name: uploader,
                category,
                content_rating: contentRating,
                tags,
                video_url: videoUrl,
                thumbnail_url: thumbnail,
                age_verification: true,
                upload_ip: 'client-ip-placeholder',
                status: 'active',
                views: 0,
                likes: 0
            });
            
            closeModal();
            loadVideos();
            alert('Video added successfully!');
        } catch (error) {
            console.error('Error adding video:', error);
            alert('Error adding video. Please try again.');
        }
    });
}

async function editVideo(id) {
    const video = videos.find(v => v.id === id);
    if (!video) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Edit Video</h2>
        <form id="editVideoForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="editVideoTitle" value="${video.title}" required>
            </div>
            <div class="form-group">
                <label>Website</label>
                <input type="text" id="editVideoWebsite" value="${video.website || ''}" required>
            </div>
            <div class="form-group">
                <label>Uploader Name</label>
                <input type="text" id="editVideoUploader" value="${video.uploader_name || 'kerala kambi'}" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="editVideoCategory" required>
                    <option value="adult" ${video.category === 'adult' ? 'selected' : ''}>Adult</option>
                    <option value="amateur" ${video.category === 'amateur' ? 'selected' : ''}>Amateur</option>
                    <option value="professional" ${video.category === 'professional' ? 'selected' : ''}>Professional</option>
                    <option value="couples" ${video.category === 'couples' ? 'selected' : ''}>Couples</option>
                    <option value="solo" ${video.category === 'solo' ? 'selected' : ''}>Solo</option>
                    <option value="fetish" ${video.category === 'fetish' ? 'selected' : ''}>Fetish</option>
                    <option value="vintage" ${video.category === 'vintage' ? 'selected' : ''}>Vintage</option>
                </select>
            </div>
            <div class="form-group">
                <label>Content Rating</label>
                <select id="editVideoContentRating" required>
                    <option value="adult (explicit)" ${video.content_rating === 'adult (explicit)' ? 'selected' : ''}>Adult (Explicit)</option>
                    <option value="mature" ${video.content_rating === 'mature' ? 'selected' : ''}>Mature</option>
                    <option value="adult" ${video.content_rating === 'adult' ? 'selected' : ''}>Adult</option>
                </select>
            </div>
            <div class="form-group">
                <label>Tags (comma separated)</label>
                <input type="text" id="editVideoTags" value="${Array.isArray(video.tags) ? video.tags.join(', ') : (video.tags || '')}">
            </div>
            <div class="form-group">
                <label>Video URL</label>
                <input type="url" id="editVideoUrl" value="${video.video_url || video.videoUrl || ''}" required>
            </div>
            <div class="form-group">
                <label>Thumbnail URL</label>
                <input type="url" id="editVideoThumbnail" value="${video.thumbnail_url || video.thumbnail || ''}">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="editVideoActive" ${video.isActive !== false ? 'checked' : ''}>
                    Active
                </label>
            </div>
            <button type="submit" class="form-submit">Update Video</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('editVideoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedData = {
            title: document.getElementById('editVideoTitle').value,
            website: document.getElementById('editVideoWebsite').value,
            uploader_name: document.getElementById('editVideoUploader').value,
            category: document.getElementById('editVideoCategory').value,
            content_rating: document.getElementById('editVideoContentRating').value,
            tags: document.getElementById('editVideoTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            video_url: document.getElementById('editVideoUrl').value,
            thumbnail_url: document.getElementById('editVideoThumbnail').value,
            isActive: document.getElementById('editVideoActive').checked
        };
        
        try {
            await dbOperations.update('videos', id, updatedData);
            closeModal();
            loadVideos();
            alert('Video updated successfully!');
        } catch (error) {
            console.error('Error updating video:', error);
            alert('Error updating video. Please try again.');
        }
    });
}

async function deleteVideo(id) {
    const video = videos.find(v => v.id === id);
    if (!video) return;
    
    if (confirm(`Are you sure you want to delete "${video.title}"?`)) {
        try {
            await dbOperations.delete('videos', id);
            loadVideos();
            alert('Video deleted successfully!');
        } catch (error) {
            console.error('Error deleting video:', error);
            alert('Error deleting video: ' + (error.message || 'Unknown error'));
        }
    }
}

function viewVideo(id) {
    const video = videos.find(v => v.id === id);
    if (!video) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>${video.title}</h2>
        <div class="video-viewer">
            <video controls style="width: 100%; max-width: 600px;">
                <source src="${video.video_url || video.videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="video-info-detailed">
                <p><strong>Website:</strong> ${video.website || 'N/A'}</p>
                <p><strong>Uploader:</strong> ${video.uploader_name || 'Kerala Kambi'}</p>
                <p><strong>Category:</strong> ${video.category || 'adult'}</p>
                <p><strong>Content Rating:</strong> ${video.content_rating || 'adult (explicit)'}</p>
                <p><strong>Age Verification:</strong> ${video.age_verification ? 'Required' : 'Not Required'}</p>
                <p><strong>Upload IP:</strong> ${video.upload_ip || 'client-ip-placeholder'}</p>
                <p><strong>Status:</strong> ${video.status || 'active'}</p>
                <p><strong>Views:</strong> ${video.views || 0}</p>
                <p><strong>Likes:</strong> ${video.likes || 0}</p>
                <p><strong>Tags:</strong> ${Array.isArray(video.tags) ? video.tags.join(', ') : (video.tags || 'No tags')}</p>
                <p><strong>Thumbnail URL:</strong> ${video.thumbnail_url || 'No thumbnail'}</p>
                <p><strong>Video URL:</strong> ${video.video_url || 'No URL'}</p>
                <p><strong>Uploaded:</strong> ${new Date(video.created_at?.seconds * 1000 || Date.now()).toLocaleString()}</p>
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function refreshVideos() {
    loadVideos();
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Make functions global
window.goBack = goBack;
window.showAddVideoForm = showAddVideoForm;
window.editVideo = editVideo;
window.deleteVideo = deleteVideo;
window.viewVideo = viewVideo;
window.refreshVideos = refreshVideos;
window.closeModal = closeModal;