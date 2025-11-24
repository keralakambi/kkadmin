// supabaseOperations is available globally from supabase-config.js

let reels = [];

document.addEventListener('DOMContentLoaded', () => {
    loadReels();
});

function goBack() {
    window.location.href = '../index.html';
}

async function loadReels() {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        reels = await supabaseOperations.getReels();
        displayReels();
        updateStats();
    } catch (error) {
        console.error('Error loading reels:', error);
        document.getElementById('reelsList').innerHTML = `
            <div class="error-message">
                <h3>Database Setup Required</h3>
                <p>Please create the following table in your Supabase dashboard:</p>
                <pre>CREATE TABLE reels (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);</pre>
            </div>
        `;
    }
}

function displayReels() {
    const reelsList = document.getElementById('reelsList');
    
    if (reels.length === 0) {
        reelsList.innerHTML = '<div class="no-items">No reels found</div>';
        return;
    }

    reelsList.innerHTML = reels.map(reel => `
        <div class="item-card">
            <div class="video-info">
                <video style="width: 100px; height: 60px; object-fit: cover; border-radius: 4px;" controls>
                    <source src="${reel.url}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="video-details">
                    <h4>Reel #${reel.id}</h4>
                    <p>URL: ${reel.url}</p>
                    <p>Uploaded: ${new Date(reel.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="edit-btn" data-id="${reel.id}">Edit</button>
                <button class="view-btn" data-id="${reel.id}">View</button>
                <button class="delete-btn" data-id="${reel.id}">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editReel(btn.dataset.id));
    });
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => viewReel(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteReel(btn.dataset.id));
    });
}

function updateStats() {
    document.getElementById('totalReels').textContent = reels.length;
}

function showAddReelForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add New Reel</h2>
        <form id="reelForm">
            <div class="form-group">
                <label>Reel URL</label>
                <input type="url" id="reelUrl" required>
            </div>
            <button type="submit" class="form-submit">Add Reel</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('reelForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const reelData = {
            url: document.getElementById('reelUrl').value
        };
        
        try {
            await supabaseOperations.addReel(reelData);
            closeModal();
            loadReels();
            alert('Reel added successfully!');
        } catch (error) {
            console.error('Error adding reel:', error);
            alert('Error adding reel. Please try again.');
        }
    });
}

async function editReel(id) {
    const reel = reels.find(r => r.id === id);
    if (!reel) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Edit Reel</h2>
        <form id="editReelForm">
            <div class="form-group">
                <label>Reel URL</label>
                <input type="url" id="editReelUrl" value="${reel.url}" required>
            </div>
            <button type="submit" class="form-submit">Update Reel</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('editReelForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedData = {
            url: document.getElementById('editReelUrl').value,
            updated_at: new Date().toISOString()
        };
        
        try {
            await supabaseOperations.updateReel(id, updatedData);
            closeModal();
            loadReels();
            alert('Reel updated successfully!');
        } catch (error) {
            console.error('Error updating reel:', error);
            alert('Error updating reel. Please try again.');
        }
    });
}

async function deleteReel(id) {
    const reel = reels.find(r => r.id === id);
    if (!reel) return;
    
    if (confirm(`Are you sure you want to delete Reel #${reel.id}?`)) {
        try {
            await supabaseOperations.deleteReel(id);
            loadReels();
            alert('Reel deleted successfully!');
        } catch (error) {
            console.error('Error deleting reel:', error);
            alert('Error deleting reel. Please try again.');
        }
    }
}

function viewReel(id) {
    const reel = reels.find(r => r.id === id);
    if (!reel) return;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Reel #${reel.id}</h2>
        <div class="reel-viewer">
            <video controls style="width: 100%; max-width: 600px;">
                <source src="${reel.url}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="reel-info-detailed">
                <p><strong>URL:</strong> ${reel.url}</p>
                <p><strong>Uploaded:</strong> ${new Date(reel.created_at).toLocaleString()}</p>
                <p><strong>Last Updated:</strong> ${reel.updated_at ? new Date(reel.updated_at).toLocaleString() : 'Never'}</p>
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function refreshReels() {
    loadReels();
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
window.showAddReelForm = showAddReelForm;
window.editReel = editReel;
window.deleteReel = deleteReel;
window.viewReel = viewReel;
window.refreshReels = refreshReels;
window.closeModal = closeModal;