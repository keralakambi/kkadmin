import { dbOperations } from '../firebase-config.js';

// Polls Management
async function loadPolls() {
    try {
        const polls = await dbOperations.getAll('polls');
        const pollsList = document.getElementById('pollsList');
        
        pollsList.innerHTML = polls.map(poll => `
            <div class="item-card">
                <div class="item-header">
                    <div>
                        <div class="item-title">${poll.question}</div>
                        <div>Options: ${poll.options?.length || 0} | Votes: ${poll.totalVotes || 0}</div>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="editPoll('${poll.id}')">Edit</button>
                        <button class="delete-btn" onclick="deletePoll('${poll.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading polls:', error);
    }
}

function showAddPollForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add New Poll</h2>
        <form id="pollForm">
            <div class="form-group">
                <label>Question</label>
                <input type="text" id="pollQuestion" required>
            </div>
            <div class="form-group">
                <label>Options (one per line)</label>
                <textarea id="pollOptions" rows="4" required></textarea>
            </div>
            <button type="submit" class="form-submit">Add Poll</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('pollForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const question = document.getElementById('pollQuestion').value;
        const options = document.getElementById('pollOptions').value.split('\n').filter(opt => opt.trim());
        
        try {
            await dbOperations.add('polls', {
                question,
                options: options.map(opt => ({ text: opt.trim(), votes: 0 })),
                totalVotes: 0,
                isActive: true
            });
            closeModal();
            loadPolls();
        } catch (error) {
            console.error('Error adding poll:', error);
        }
    });
}

async function deletePoll(id) {
    if (confirm('Are you sure you want to delete this poll?')) {
        try {
            await dbOperations.delete('polls', id);
            loadPolls();
        } catch (error) {
            console.error('Error deleting poll:', error);
        }
    }
}

async function editPoll(id) {
    try {
        const polls = await dbOperations.getAll('polls');
        const poll = polls.find(p => p.id === id);
        if (poll) {
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <h2>Edit Poll</h2>
                <form id="editPollForm">
                    <div class="form-group">
                        <label>Question</label>
                        <input type="text" id="editPollQuestion" value="${poll.question}" required>
                    </div>
                    <div class="form-group">
                        <label>Options (one per line)</label>
                        <textarea id="editPollOptions" rows="4" required>${poll.options?.map(opt => opt.text || opt).join('\n') || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Active</label>
                        <input type="checkbox" id="editPollActive" ${poll.isActive ? 'checked' : ''}>
                    </div>
                    <button type="submit" class="form-submit">Update Poll</button>
                </form>
            `;
            
            document.getElementById('modal').style.display = 'block';
            
            document.getElementById('editPollForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const question = document.getElementById('editPollQuestion').value;
                const optionsText = document.getElementById('editPollOptions').value;
                const isActive = document.getElementById('editPollActive').checked;
                const options = optionsText.split('\n').filter(opt => opt.trim()).map((opt, index) => ({
                    text: opt.trim(),
                    votes: poll.options?.[index]?.votes || 0
                }));
                
                await dbOperations.update('polls', id, { question, options, isActive });
                closeModal();
                loadPolls();
                alert('✅ Poll updated!');
            });
        }
    } catch (error) {
        console.error('Error editing poll:', error);
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Make functions global
window.showAddPollForm = showAddPollForm;
window.editPoll = editPoll;
window.deletePoll = deletePoll;
window.closeModal = closeModal;

// Load polls on page load
document.addEventListener('DOMContentLoaded', loadPolls);