import { dbOperations } from '../firebase-config.js';

// Models Management
async function loadModels() {
    try {
        const models = await dbOperations.getAll('models');
        const modelsList = document.getElementById('modelsList');
        
        modelsList.innerHTML = models.map(model => `
            <div class="item-card">
                <div class="item-header">
                    <div>
                        <div class="item-title">${model.displayName || model.name}</div>
                        <div>Age: ${model.age} | Country: ${model.country}</div>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="editModel('${model.id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteModel('${model.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading models:', error);
    }
}

function showAddModelForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add Model</h2>
        <form id="modelForm">
            <div class="form-group">
                <label>Username</label>
                <input type="text" id="modelUsername" required>
            </div>
            <div class="form-group">
                <label>Display Name</label>
                <input type="text" id="modelDisplayName" required>
            </div>
            <div class="form-group">
                <label>Stage Name</label>
                <input type="text" id="modelStageName" required>
            </div>
            <div class="form-group">
                <label>Age</label>
                <input type="number" id="modelAge" required>
            </div>
            <div class="form-group">
                <label>Country</label>
                <input type="text" id="modelCountry" required>
            </div>
            <div class="form-group">
                <label>City</label>
                <input type="text" id="modelCity">
            </div>
            <div class="form-group">
                <label>Height</label>
                <input type="text" id="modelHeight">
            </div>
            <div class="form-group">
                <label>Ethnicity</label>
                <input type="text" id="modelEthnicity">
            </div>
            <div class="form-group">
                <label>Bio</label>
                <textarea id="modelBio" rows="4"></textarea>
            </div>
            <div class="form-group">
                <label>Avatar URL</label>
                <input type="url" id="modelAvatar">
            </div>
            <div class="form-group">
                <label>Category</label>
                <input type="text" id="modelCategory">
            </div>
            <button type="submit" class="form-submit">Add Model</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('modelForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('modelUsername').value;
        const displayName = document.getElementById('modelDisplayName').value;
        const stageName = document.getElementById('modelStageName').value;
        const age = parseInt(document.getElementById('modelAge').value);
        const country = document.getElementById('modelCountry').value;
        const city = document.getElementById('modelCity').value;
        const height = document.getElementById('modelHeight').value;
        const ethnicity = document.getElementById('modelEthnicity').value;
        const bio = document.getElementById('modelBio').value;
        const avatar = document.getElementById('modelAvatar').value;
        const category = document.getElementById('modelCategory').value;
        
        try {
            await dbOperations.add('models', {
                username,
                displayName,
                stageName,
                realName: 'N/A',
                age,
                country,
                city,
                height,
                ethnicity,
                yearsActive: new Date().getFullYear() + '-present',
                verified: false,
                bio,
                avatar,
                category,
                trending: false,
                genres: [],
                socialLinks: {},
                noteworthyCareerEvents: [],
                followers: 0,
                following: 0,
                collections: { images: 0, videos: 0, reels: 0 },
                posts: [
                    {
                        id: Date.now(),
                        type: "image",
                        content: "https://example.com/sample-post.jpg",
                        url: "https://example.com/post/sample-001",
                        caption: "Welcome to my profile! 👋",
                        likes: 0,
                        comments: 0,
                        timestamp: new Date().toISOString(),
                        liked: false
                    }
                ]
            });
            closeModal();
            loadModels();
        } catch (error) {
            console.error('Error adding model:', error);
        }
    });
}

async function deleteModel(id) {
    if (confirm('Are you sure you want to delete this model?')) {
        try {
            await dbOperations.delete('models', id);
            loadModels();
        } catch (error) {
            console.error('Error deleting model:', error);
        }
    }
}

async function editModel(id) {
    try {
        const models = await dbOperations.getAll('models');
        const model = models.find(m => m.id === id || m.id === String(id));
        if (model) {
            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <h2>Edit Model</h2>
                <div style="max-height: 70vh; overflow-y: auto;">
                <form id="editModelForm">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group">
                            <label>Username</label>
                            <input type="text" id="editModelUsername" value="${model.username || ''}">
                        </div>
                        <div class="form-group">
                            <label>Display Name</label>
                            <input type="text" id="editModelDisplayName" value="${model.displayName || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Stage Name</label>
                            <input type="text" id="editModelStageName" value="${model.stageName || ''}">
                        </div>
                        <div class="form-group">
                            <label>Real Name</label>
                            <input type="text" id="editModelRealName" value="${model.realName || ''}">
                        </div>
                        <div class="form-group">
                            <label>Age</label>
                            <input type="number" id="editModelAge" value="${model.age || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>Birth Date</label>
                            <input type="date" id="editModelBirthDate" value="${model.birthDate || ''}">
                        </div>
                        <div class="form-group">
                            <label>Country</label>
                            <input type="text" id="editModelCountry" value="${model.country || ''}" required>
                        </div>
                        <div class="form-group">
                            <label>City</label>
                            <input type="text" id="editModelCity" value="${model.city || ''}">
                        </div>
                        <div class="form-group">
                            <label>Height</label>
                            <input type="text" id="editModelHeight" value="${model.height || ''}">
                        </div>
                        <div class="form-group">
                            <label>Weight</label>
                            <input type="text" id="editModelWeight" value="${model.weight || ''}">
                        </div>
                        <div class="form-group">
                            <label>Measurements</label>
                            <input type="text" id="editModelMeasurements" value="${model.measurements || ''}">
                        </div>
                        <div class="form-group">
                            <label>Ethnicity</label>
                            <input type="text" id="editModelEthnicity" value="${model.ethnicity || ''}">
                        </div>
                        <div class="form-group">
                            <label>Hair Color</label>
                            <input type="text" id="editModelHairColor" value="${model.hairColor || ''}">
                        </div>
                        <div class="form-group">
                            <label>Eye Color</label>
                            <input type="text" id="editModelEyeColor" value="${model.eyeColor || ''}">
                        </div>
                        <div class="form-group">
                            <label>Tattoos</label>
                            <input type="text" id="editModelTattoos" value="${model.tattoos || ''}">
                        </div>
                        <div class="form-group">
                            <label>Piercings</label>
                            <input type="text" id="editModelPiercings" value="${model.piercings || ''}">
                        </div>
                        <div class="form-group">
                            <label>Career Start</label>
                            <input type="number" id="editModelCareerStart" value="${model.careerStart || ''}">
                        </div>
                        <div class="form-group">
                            <label>Years Active</label>
                            <input type="text" id="editModelYearsActive" value="${model.yearsActive || ''}">
                        </div>
                        <div class="form-group">
                            <label>Category</label>
                            <input type="text" id="editModelCategory" value="${model.category || ''}">
                        </div>
                        <div class="form-group">
                            <label>Followers</label>
                            <input type="number" id="editModelFollowers" value="${model.followers || 0}">
                        </div>
                        <div class="form-group">
                            <label>Following</label>
                            <input type="number" id="editModelFollowing" value="${model.following || 0}">
                        </div>
                        <div class="form-group">
                            <label>Verified</label>
                            <input type="checkbox" id="editModelVerified" ${model.verified ? 'checked' : ''}>
                        </div>
                        <div class="form-group">
                            <label>Trending</label>
                            <input type="checkbox" id="editModelTrending" ${model.trending ? 'checked' : ''}>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Bio</label>
                        <textarea id="editModelBio" rows="3">${model.bio || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Avatar URL</label>
                        <input type="url" id="editModelAvatar" value="${model.avatar || ''}">
                    </div>
                    <div class="form-group">
                        <label>Genres (comma separated)</label>
                        <input type="text" id="editModelGenres" value="${(model.genres || []).join(', ')}">
                    </div>
                    <div class="form-group">
                        <label>Social Media</label>
                        <div id="socialLinksContainer"></div>
                        <button type="button" onclick="addSocialLink()">+ Add Social Link</button>
                    </div>
                    <div class="form-group">
                        <label>Career Events</label>
                        <div id="careerEventsContainer"></div>
                        <button type="button" onclick="addCareerEvent()">+ Add Career Event</button>
                    </div>
                    <div class="form-group">
                        <label>Posts</label>
                        <div id="postsContainer"></div>
                        <button type="button" onclick="addPost()">+ Add Post</button>
                    </div>
                    <button type="submit" class="form-submit">Update Model</button>
                </form>
                </div>
            `;
            
            document.getElementById('modal').style.display = 'block';
            
            // Initialize dynamic sections
            initializeSocialLinks(model.socialLinks || {});
            initializeCareerEvents(model.noteworthyCareerEvents || []);
            initializePosts(model.posts || []);
            
            document.getElementById('editModelForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('editModelUsername').value;
                const displayName = document.getElementById('editModelDisplayName').value;
                const stageName = document.getElementById('editModelStageName').value;
                const realName = document.getElementById('editModelRealName').value;
                const age = parseInt(document.getElementById('editModelAge').value);
                const birthDate = document.getElementById('editModelBirthDate').value;
                const country = document.getElementById('editModelCountry').value;
                const city = document.getElementById('editModelCity').value;
                const height = document.getElementById('editModelHeight').value;
                const weight = document.getElementById('editModelWeight').value;
                const measurements = document.getElementById('editModelMeasurements').value;
                const ethnicity = document.getElementById('editModelEthnicity').value;
                const hairColor = document.getElementById('editModelHairColor').value;
                const eyeColor = document.getElementById('editModelEyeColor').value;
                const tattoos = document.getElementById('editModelTattoos').value;
                const piercings = document.getElementById('editModelPiercings').value;
                const careerStart = parseInt(document.getElementById('editModelCareerStart').value) || null;
                const yearsActive = document.getElementById('editModelYearsActive').value;
                const bio = document.getElementById('editModelBio').value;
                const avatar = document.getElementById('editModelAvatar').value;
                const category = document.getElementById('editModelCategory').value;
                const followers = parseInt(document.getElementById('editModelFollowers').value) || 0;
                const following = parseInt(document.getElementById('editModelFollowing').value) || 0;
                const verified = document.getElementById('editModelVerified').checked;
                const trending = document.getElementById('editModelTrending').checked;
                const genres = document.getElementById('editModelGenres').value.split(',').map(g => g.trim()).filter(g => g);
                
                // Collect social links
                const socialLinks = {};
                document.querySelectorAll('#socialLinksContainer .social-link-item').forEach(item => {
                    const app = item.querySelector('.social-app').value;
                    const id = item.querySelector('.social-id').value;
                    if (app && id) socialLinks[app] = id;
                });
                
                // Collect career events
                const careerEvents = [];
                document.querySelectorAll('#careerEventsContainer .career-event-item input').forEach(input => {
                    if (input.value.trim()) careerEvents.push(input.value.trim());
                });
                
                // Collect posts
                const posts = [];
                document.querySelectorAll('#postsContainer .post-item').forEach(item => {
                    const post = {
                        id: parseInt(item.querySelector('.post-id').value) || Date.now(),
                        type: item.querySelector('.post-type').value,
                        content: item.querySelector('.post-content').value,
                        url: item.querySelector('.post-url').value,
                        caption: item.querySelector('.post-caption').value,
                        likes: parseInt(item.querySelector('.post-likes').value) || 0,
                        comments: parseInt(item.querySelector('.post-comments').value) || 0,
                        timestamp: item.querySelector('.post-timestamp').value || new Date().toISOString(),
                        liked: false
                    };
                    posts.push(post);
                });
                
                // Auto-calculate collections
                const collections = {
                    images: posts.filter(p => p.type === 'image').length,
                    videos: posts.filter(p => p.type === 'video').length,
                    reels: posts.filter(p => p.type === 'reel').length
                };
                
                await dbOperations.update('models', id, {
                    username, displayName, stageName, realName, age, birthDate,
                    country, city, height, weight, measurements, ethnicity,
                    hairColor, eyeColor, tattoos, piercings, careerStart, yearsActive,
                    bio, avatar, category, followers, following, verified, trending,
                    genres, socialLinks, noteworthyCareerEvents: careerEvents,
                    posts, collections
                });
                closeModal();
                loadModels();
                alert('✅ Model updated!');
            });
        } else {
            alert('❌ Model not found!');
        }
    } catch (error) {
        console.error('Error editing model:', error);
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Dynamic UI functions
function initializeSocialLinks(socialLinks) {
    const container = document.getElementById('socialLinksContainer');
    container.innerHTML = '';
    Object.entries(socialLinks).forEach(([app, id]) => {
        addSocialLinkItem(app, id);
    });
}

function addSocialLink() {
    addSocialLinkItem('', '');
}

function addSocialLinkItem(app = '', id = '') {
    const container = document.getElementById('socialLinksContainer');
    const item = document.createElement('div');
    item.className = 'social-link-item';
    item.style.cssText = 'display: flex; gap: 10px; margin-bottom: 5px; align-items: center;';
    item.innerHTML = `
        <select class="social-app" style="width: 120px;">
            <option value="twitter" ${app === 'twitter' ? 'selected' : ''}>Twitter/X</option>
            <option value="instagram" ${app === 'instagram' ? 'selected' : ''}>Instagram</option>
            <option value="onlyfans" ${app === 'onlyfans' ? 'selected' : ''}>OnlyFans</option>
            <option value="website" ${app === 'website' ? 'selected' : ''}>Website</option>
            <option value="youtube" ${app === 'youtube' ? 'selected' : ''}>YouTube</option>
            <option value="tiktok" ${app === 'tiktok' ? 'selected' : ''}>TikTok</option>
        </select>
        <input type="text" class="social-id" placeholder="@username or URL" value="${id}" style="flex: 1;">
        <button type="button" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(item);
}

function initializeCareerEvents(events) {
    const container = document.getElementById('careerEventsContainer');
    container.innerHTML = '';
    events.forEach(event => {
        addCareerEventItem(event);
    });
}

function addCareerEvent() {
    addCareerEventItem('');
}

function addCareerEventItem(event = '') {
    const container = document.getElementById('careerEventsContainer');
    const item = document.createElement('div');
    item.className = 'career-event-item';
    item.style.cssText = 'display: flex; gap: 10px; margin-bottom: 5px; align-items: center;';
    item.innerHTML = `
        <input type="text" placeholder="Career event or achievement" value="${event}" style="flex: 1;">
        <button type="button" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(item);
}

function initializePosts(posts) {
    const container = document.getElementById('postsContainer');
    container.innerHTML = '';
    posts.forEach(post => {
        addPostItem(post);
    });
}

function addPost() {
    addPostItem();
}

function addPostItem(post = {}) {
    const container = document.getElementById('postsContainer');
    const item = document.createElement('div');
    item.className = 'post-item';
    item.style.cssText = 'border: 1px solid #333; padding: 10px; margin-bottom: 10px; border-radius: 5px;';
    item.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <input type="number" class="post-id" placeholder="ID (auto)" value="${post.id || Date.now()}" readonly>
            <select class="post-type">
                <option value="image" ${post.type === 'image' ? 'selected' : ''}>Image</option>
                <option value="video" ${post.type === 'video' ? 'selected' : ''}>Video</option>
                <option value="external" ${post.type === 'external' ? 'selected' : ''}>External</option>
                <option value="reel" ${post.type === 'reel' ? 'selected' : ''}>Reel</option>
            </select>
            <button type="button" onclick="this.closest('.post-item').remove()" style="background: #e91e63;">Remove</button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <input type="url" class="post-content" placeholder="Content URL" value="${post.content || ''}">
            <input type="url" class="post-url" placeholder="Post URL" value="${post.url || ''}">
        </div>
        <textarea class="post-caption" placeholder="Caption" rows="2" style="width: 100%; margin-bottom: 10px;">${post.caption || ''}</textarea>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <input type="number" class="post-likes" placeholder="Likes" value="${post.likes || 0}">
            <input type="number" class="post-comments" placeholder="Comments" value="${post.comments || 0}">
            <input type="datetime-local" class="post-timestamp" value="${post.timestamp ? new Date(post.timestamp).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}">
        </div>
    `;
    container.appendChild(item);
}

// Make functions global
window.showAddModelForm = showAddModelForm;
window.editModel = editModel;
window.deleteModel = deleteModel;
window.closeModal = closeModal;
window.addSocialLink = addSocialLink;
window.addCareerEvent = addCareerEvent;
window.addPost = addPost;

// Load models on page load
document.addEventListener('DOMContentLoaded', loadModels);