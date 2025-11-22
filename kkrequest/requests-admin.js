import { dbOperations } from '../firebase-config.js';

// Requests Management
async function loadRequests() {
    try {
        const requests = await dbOperations.getAll('requests');
        const requestsList = document.getElementById('requestsList');
        
        requestsList.innerHTML = requests.map(request => `
            <div class="item-card">
                <div class="item-header">
                    <div>
                        <div class="item-title">${request.title}</div>
                        <div>Platform: ${request.platform} | Status: ${request.status} | Priority: ${request.priority}</div>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="updateRequestStatus('${request.id}')">Update Status</button>
                        <button class="delete-btn" onclick="deleteRequest('${request.id}')">Delete</button>
                    </div>
                </div>
                <div style="margin-top: 10px; color: rgba(255,255,255,0.8);">
                    ${request.description?.substring(0, 100) || 'No description'}...
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading requests:', error);
    }
}

async function updateRequestStatus(id) {
    const newStatus = prompt('Enter new status (pending/in-progress/completed):');
    if (newStatus && ['pending', 'in-progress', 'completed'].includes(newStatus)) {
        try {
            await dbOperations.update('requests', id, { status: newStatus });
            loadRequests();
        } catch (error) {
            console.error('Error updating request:', error);
        }
    }
}

async function deleteRequest(id) {
    if (confirm('Are you sure you want to delete this request?')) {
        try {
            await dbOperations.delete('requests', id);
            loadRequests();
        } catch (error) {
            console.error('Error deleting request:', error);
        }
    }
}

// Make functions global
window.updateRequestStatus = updateRequestStatus;
window.deleteRequest = deleteRequest;

// Load requests on page load
document.addEventListener('DOMContentLoaded', loadRequests);