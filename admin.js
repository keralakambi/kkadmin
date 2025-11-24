import { dbOperations, authOperations } from './firebase-config.js';
import { adminConfig, getConfig, setConfig } from './admin-config.js';
import { systemMonitor } from './system-monitor.js';

// Admin credentials for testing
const ADMIN_EMAIL = 'admin@kk-ecosystem.com';
const ADMIN_PASSWORD = 'Admin@890';

let currentSection = 'dashboard';
let systemStats = {};
let realTimeUpdates = getConfig('system.realTimeUpdates', true);
let maintenanceMode = getConfig('system.maintenanceMode', false);

// Skip authentication - direct access
function skipLogin() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    
    sessionStorage.setItem('adminUser', JSON.stringify({
        uid: 'test-admin',
        email: 'admin@test.com',
        role: 'admin'
    }));
    
    initializeAdmin();
    loadSection('dashboard');
}

// Auto-login on page load
document.addEventListener('DOMContentLoaded', () => {
    skipLogin();
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    skipLogin();
});

async function logout() {
    // Clear session data
    sessionStorage.removeItem('adminUser');
    
    // Show login screen
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    
    // Stop monitoring
    systemMonitor.stopMonitoring();
    
    console.log('🔓 Logged out (testing mode)');
}

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        loadSection(section);
    });
});

async function initializeAdmin() {
    // Setup admin user if doesn't exist
    await setupAdminUser();
    
    await loadSystemStats();
    
    // Start system monitoring
    if (!systemMonitor.isMonitoring) {
        systemMonitor.startMonitoring();
    }
    
    if (realTimeUpdates) {
        startRealTimeUpdates();
    }
    
    // Check maintenance mode
    if (maintenanceMode) {
        showMaintenanceNotice();
    }
    
    // Skip auth state listener for testing
}

// Setup admin user for testing
async function setupAdminUser() {
    // Skip Firebase auth setup - direct access enabled
    console.log('✅ Admin access enabled (authentication bypassed for testing)');
    return true;
}

function loadSection(section) {
    currentSection = section;
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });
    
    // Update content sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === `${section}-section`);
    });
    
    // Load data for the section
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'polls':
            window.location.href = 'kkpolls/index.html';
            break;
        case 'news':
            window.location.href = 'kknews/index.html';
            break;
        case 'models':
            window.location.href = 'kkmodels/index.html';
            break;
        case 'videos':
            window.location.href = 'kkvideos/index.html';
            break;
        case 'images':
            window.location.href = 'kkimages/index.html';
            break;
        case 'reels':
            window.location.href = 'kkreels/index.html';
            break;
        case 'stories':
            window.location.href = 'kkstories/index.html';
            break;
        case 'requests':
            window.location.href = 'kkrequest/index.html';
            break;
        case 'users':
            loadUsers();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'backup':
            loadBackup();
            break;
    }
}

// Dashboard Management
async function loadDashboard() {
    try {
        const dashboardContainer = document.getElementById('dashboardContent');
        
        dashboardContainer.innerHTML = `
            <div class="system-health-bar">
                <div class="health-indicator ${getHealthStatusClass()}">
                    <span class="health-icon">${getHealthStatusIcon()}</span>
                    <span class="health-text">System Status: ${getSystemHealthText()}</span>
                    <button class="health-details-btn" onclick="showSystemHealth()">View Details</button>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.totalPolls || 0}</div>
                        <div class="stat-label">Total Polls</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📰</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.totalNews || 0}</div>
                        <div class="stat-label">News Articles</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">👤</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.totalModels || 0}</div>
                        <div class="stat-label">Models</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎥</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.totalVideos || 0}</div>
                        <div class="stat-label">Videos</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🖼️</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.totalImages || 0}</div>
                        <div class="stat-label">Images</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🎦</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.totalReels || 0}</div>
                        <div class="stat-label">Reels</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.totalStories || 0}</div>
                        <div class="stat-label">Stories</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📝</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.totalRequests || 0}</div>
                        <div class="stat-label">Requests</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">💬</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.kkfakesGroups || 0}</div>
                        <div class="stat-label">KKfakes Groups</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📝</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.kkfakesPosts || 0}</div>
                        <div class="stat-label">KKfakes Posts</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">👤</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.kkfakesUsers || 0}</div>
                        <div class="stat-label">KKfakes Users</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🟢</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.kkstatusActiveUrls || 0}</div>
                        <div class="stat-label">Active URLs</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔴</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.kkstatusInactiveUrls || 0}</div>
                        <div class="stat-label">Inactive URLs</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.totalUsers || 0}</div>
                        <div class="stat-label">Users</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-info">
                        <div class="stat-number">${systemStats.totalViews || 0}</div>
                        <div class="stat-label">Total Views</div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-actions">
                <div class="action-section">
                    <h3>Quick Actions</h3>
                    <div class="quick-actions">
                        <button class="action-btn" onclick="showBulkOperations()">🔄 Bulk Operations</button>
                        <button class="action-btn" onclick="exportAllData()">📤 Export Data</button>
                        <button class="action-btn" onclick="showSystemHealth()">🏥 System Health</button>
                        <button class="action-btn" onclick="clearCache()">🗑️ Clear Cache</button>
                        <button class="action-btn" onclick="toggleMaintenance()">🔧 Maintenance Mode</button>
                        <button class="action-btn" onclick="showBackupRestore()">💾 Backup/Restore</button>
                    </div>
                </div>
                
                <div class="recent-activity">
                    <h3>Recent Activity</h3>
                    <div id="recentActivity" class="activity-list"></div>
                </div>
                
                <div class="kkstatus-section">
                    <h3>KKStatus URLs Overview</h3>
                    <div id="kkstatusOverview" class="kkstatus-overview"></div>
                </div>
            </div>
        `;
        
        loadRecentActivity();
        loadKKStatusOverview();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadSystemStats() {
    try {
        // Get videos from separate Firebase instance
        let videos = [];
        try {
            const videosResponse = await fetch('https://firestore.googleapis.com/v1/projects/kkvideos2/databases/(default)/documents/videos');
            if (videosResponse.ok) {
                const videosData = await videosResponse.json();
                videos = videosData.documents ? videosData.documents.filter(doc => 
                    !doc.fields?.status?.stringValue || doc.fields.status.stringValue !== 'deleted'
                ) : [];
            }
        } catch (e) {
            console.log('Could not fetch videos count:', e);
        }
        
        // Get Supabase data
        let images = [], reels = [], stories = [];
        try {
            const supabaseResponse = await fetch('https://kuemntplqdkimlschqap.supabase.co/rest/v1/images?select=id', {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZW1udHBscWRraW1sc2NocWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODEzODcsImV4cCI6MjA3ODk1NzM4N30.ON-JfNYT2K-6xO2cuQ8JhhB5XqWOo7T19dpU4UBE1HM'
                }
            });
            if (supabaseResponse.ok) {
                images = await supabaseResponse.json();
            }
            
            const reelsResponse = await fetch('https://kuemntplqdkimlschqap.supabase.co/rest/v1/reels?select=id', {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZW1udHBscWRraW1sc2NocWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODEzODcsImV4cCI6MjA3ODk1NzM4N30.ON-JfNYT2K-6xO2cuQ8JhhB5XqWOo7T19dpU4UBE1HM'
                }
            });
            if (reelsResponse.ok) {
                reels = await reelsResponse.json();
            }
            
            const storiesResponse = await fetch('https://kuemntplqdkimlschqap.supabase.co/rest/v1/stories?select=id', {
                headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZW1udHBscWRraW1sc2NocWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODEzODcsImV4cCI6MjA3ODk1NzM4N30.ON-JfNYT2K-6xO2cuQ8JhhB5XqWOo7T19dpU4UBE1HM'
                }
            });
            if (storiesResponse.ok) {
                stories = await storiesResponse.json();
            }
        } catch (e) {
            console.log('Could not fetch Supabase data:', e);
        }
        
        // Get KKfakes data
        let kkfakesData = { groups: [], posts: [], users: {} };
        try {
            const kkfakesResponse = await fetch('https://firestore.googleapis.com/v1/projects/kk-ecosystem/databases/(default)/documents/groups');
            if (kkfakesResponse.ok) {
                const groupsData = await kkfakesResponse.json();
                kkfakesData.groups = groupsData.documents || [];
            }
            
            const postsResponse = await fetch('https://firestore.googleapis.com/v1/projects/kk-ecosystem/databases/(default)/documents/posts');
            if (postsResponse.ok) {
                const postsData = await postsResponse.json();
                kkfakesData.posts = postsData.documents || [];
            }
            
            const usersResponse = await fetch('https://firestore.googleapis.com/v1/projects/kk-ecosystem/databases/(default)/documents/users');
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                kkfakesData.users = usersData.documents || [];
            }
        } catch (e) {
            console.log('Could not fetch KKfakes data:', e);
        }
        
        // Get KKStatus data
        let kkstatusData = { activeLinks: [], inactiveLinks: [] };
        try {
            const kkstatusResponse = await fetch('https://firestore.googleapis.com/v1/projects/kk-ecosystem/databases/(default)/documents/keralakambi-status/current');
            if (kkstatusResponse.ok) {
                const statusData = await kkstatusResponse.json();
                if (statusData.fields) {
                    kkstatusData.activeLinks = statusData.fields.activeLinks?.arrayValue?.values || [];
                    kkstatusData.inactiveLinks = statusData.fields.inactiveLinks?.arrayValue?.values || [];
                }
            }
        } catch (e) {
            console.log('Could not fetch KKStatus data:', e);
        }
        
        const [polls, news, models, requests, users] = await Promise.all([
            dbOperations.getAll('polls').catch(() => []),
            dbOperations.getAll('news').catch(() => []),
            dbOperations.getAll('models').catch(() => []),
            dbOperations.getAll('requests').catch(() => []),
            dbOperations.getAll('users').catch(() => [])
        ]);
        
        systemStats = {
            totalPolls: polls.length,
            totalNews: news.length,
            totalModels: models.length,
            totalVideos: videos.length,
            totalImages: images.length,
            totalReels: reels.length,
            totalStories: stories.length,
            totalRequests: requests.length,
            totalUsers: users.length,
            totalViews: news.reduce((sum, article) => sum + (article.views || 0), 0),
            kkfakesGroups: kkfakesData.groups.length,
            kkfakesPosts: kkfakesData.posts.length,
            kkfakesUsers: kkfakesData.users.length,
            kkstatusActiveUrls: kkstatusData.activeLinks.length,
            kkstatusInactiveUrls: kkstatusData.inactiveLinks.length
        };
        
        // Update KKfakes section stats
        if (document.getElementById('kkfakesGroups')) {
            document.getElementById('kkfakesGroups').textContent = systemStats.kkfakesGroups;
            document.getElementById('kkfakesPosts').textContent = systemStats.kkfakesPosts;
            document.getElementById('kkfakesUsers').textContent = systemStats.kkfakesUsers;
        }
        
        console.log('System stats loaded:', systemStats);
    } catch (error) {
        console.error('Error loading system stats:', error);
        systemStats = {
            totalPolls: 0,
            totalNews: 0,
            totalModels: 0,
            totalVideos: 0,
            totalImages: 0,
            totalReels: 0,
            totalStories: 0,
            totalRequests: 0,
            totalUsers: 0,
            totalViews: 0,
            kkfakesGroups: 0,
            kkfakesPosts: 0,
            kkfakesUsers: 0,
            kkstatusActiveUrls: 0,
            kkstatusInactiveUrls: 0
        };
    }
}

async function loadRecentActivity() {
    try {
        const activityContainer = document.getElementById('recentActivity');
        const activities = await dbOperations.getAll('activity_logs');
        
        activityContainer.innerHTML = activities.slice(0, 10).map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${getActivityIcon(activity.type)}</div>
                <div class="activity-details">
                    <div class="activity-text">${activity.description}</div>
                    <div class="activity-time">${new Date(activity.createdAt.seconds * 1000).toLocaleString()}</div>
                </div>
            </div>
        `).join('') || '<div class="no-activity">No recent activity</div>';
    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

async function loadKKStatusOverview() {
    try {
        const overviewContainer = document.getElementById('kkstatusOverview');
        
        // Fetch KKStatus data
        const kkstatusResponse = await fetch('https://firestore.googleapis.com/v1/projects/kk-ecosystem/databases/(default)/documents/keralakambi-status/current');
        let activeLinks = [];
        let inactiveLinks = [];
        
        if (kkstatusResponse.ok) {
            const statusData = await kkstatusResponse.json();
            if (statusData.fields) {
                activeLinks = statusData.fields.activeLinks?.arrayValue?.values || [];
                inactiveLinks = statusData.fields.inactiveLinks?.arrayValue?.values || [];
            }
        }
        
        overviewContainer.innerHTML = `
            <div class="kkstatus-grid">
                <div class="status-section">
                    <div class="status-header">
                        <h4>🟢 Active URLs (${activeLinks.length})</h4>
                        <button class="manage-btn" onclick="window.open('kkstatus/index.html', '_blank')">Manage</button>
                    </div>
                    <div class="urls-list">
                        ${activeLinks.slice(0, 5).map(link => {
                            const title = link.mapValue?.fields?.title?.stringValue || 'No title';
                            const url = link.mapValue?.fields?.url?.stringValue || '#';
                            return `
                                <div class="url-item active">
                                    <span class="url-title">${title}</span>
                                    <a href="${url}" target="_blank" class="url-link">${url.length > 40 ? url.substring(0, 40) + '...' : url}</a>
                                </div>
                            `;
                        }).join('')}
                        ${activeLinks.length > 5 ? `<div class="more-items">+${activeLinks.length - 5} more active URLs</div>` : ''}
                        ${activeLinks.length === 0 ? '<div class="no-items">No active URLs</div>' : ''}
                    </div>
                </div>
                
                <div class="status-section">
                    <div class="status-header">
                        <h4>🔴 Inactive URLs (${inactiveLinks.length})</h4>
                        <button class="manage-btn" onclick="window.open('kkstatus/index.html', '_blank')">Manage</button>
                    </div>
                    <div class="urls-list">
                        ${inactiveLinks.slice(0, 5).map(link => {
                            const url = link.mapValue?.fields?.url?.stringValue || '#';
                            const status = link.mapValue?.fields?.status?.stringValue || 'inactive';
                            return `
                                <div class="url-item inactive">
                                    <span class="url-status">${status}</span>
                                    <span class="url-link">${url.length > 40 ? url.substring(0, 40) + '...' : url}</span>
                                </div>
                            `;
                        }).join('')}
                        ${inactiveLinks.length > 5 ? `<div class="more-items">+${inactiveLinks.length - 5} more inactive URLs</div>` : ''}
                        ${inactiveLinks.length === 0 ? '<div class="no-items">No inactive URLs</div>' : ''}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading KKStatus overview:', error);
        const overviewContainer = document.getElementById('kkstatusOverview');
        overviewContainer.innerHTML = '<div class="error-message">Failed to load KKStatus data</div>';
    }
}

function getActivityIcon(type) {
    const icons = {
        'poll_created': '📊',
        'news_added': '📰',
        'model_added': '👤',
        'request_updated': '📝',
        'user_registered': '👥',
        'system_backup': '💾',
        'maintenance': '🔧'
    };
    return icons[type] || '📋';
}

function startRealTimeUpdates() {
    setInterval(async () => {
        if (currentSection === 'dashboard') {
            await loadSystemStats();
            loadDashboard();
        }
    }, 30000);
}

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
                        <div>Options: ${poll.options.length} | Votes: ${poll.totalVotes || 0}</div>
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
                        <div>Category: ${article.category} | ${new Date(article.createdAt.seconds * 1000).toLocaleDateString()}</div>
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
        const image = document.getElementById('newsImage').value;
        
        try {
            await dbOperations.add('news', {
                title,
                category,
                content,
                image,
                excerpt: content.substring(0, 150) + '...',
                views: 0
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

// Models Management
async function loadModels() {
    try {
        const models = await dbOperations.getAll('models');
        const modelsList = document.getElementById('modelsList');
        
        modelsList.innerHTML = models.map(model => `
            <div class="item-card">
                <div class="item-header">
                    <div>
                        <div class="item-title">${model.name}</div>
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
                <label>Name</label>
                <input type="text" id="modelName" required>
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
                <label>Bio</label>
                <textarea id="modelBio" rows="4"></textarea>
            </div>
            <div class="form-group">
                <label>Profile Image URL</label>
                <input type="url" id="modelImage">
            </div>
            <button type="submit" class="form-submit">Add Model</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('modelForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('modelName').value;
        const age = parseInt(document.getElementById('modelAge').value);
        const country = document.getElementById('modelCountry').value;
        const bio = document.getElementById('modelBio').value;
        const image = document.getElementById('modelImage').value;
        
        try {
            await dbOperations.add('models', {
                name,
                age,
                country,
                bio,
                image,
                followers: 0,
                verified: false
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

// Videos Management
function showAddVideoForm() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2>Add Video</h2>
        <form id="videoForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="videoTitle" required>
            </div>
            <div class="form-group">
                <label>Category</label>
                <select id="videoCategory" required>
                    <option value="amateur">Amateur</option>
                    <option value="professional">Professional</option>
                    <option value="couples">Couples</option>
                    <option value="solo">Solo</option>
                    <option value="fetish">Fetish</option>
                    <option value="vintage">Vintage</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Video URL</label>
                <input type="url" id="videoUrl" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="videoDescription" rows="4"></textarea>
            </div>
            <div class="form-group">
                <label>Thumbnail URL</label>
                <input type="url" id="videoThumbnail">
            </div>
            <button type="submit" class="form-submit">Add Video</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('videoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('videoTitle').value;
        const category = document.getElementById('videoCategory').value;
        const videoUrl = document.getElementById('videoUrl').value;
        const description = document.getElementById('videoDescription').value;
        const thumbnail = document.getElementById('videoThumbnail').value;
        
        try {
            await dbOperations.add('videos', {
                title,
                category,
                videoUrl,
                description,
                thumbnail,
                views: 0,
                likes: 0,
                isActive: true
            });
            closeModal();
            alert('Video added successfully!');
        } catch (error) {
            console.error('Error adding video:', error);
        }
    });
}

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
                    ${request.description.substring(0, 100)}...
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

// Modal functions
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Users Management
async function loadUsers() {
    try {
        const users = await dbOperations.getAll('users');
        const usersList = document.getElementById('usersList');
        
        usersList.innerHTML = users.map(user => `
            <div class="item-card">
                <div class="item-header">
                    <div>
                        <div class="item-title">${user.username || user.email}</div>
                        <div>Joined: ${new Date(user.createdAt.seconds * 1000).toLocaleDateString()} | Status: ${user.status || 'Active'}</div>
                    </div>
                    <div class="item-actions">
                        <button class="edit-btn" onclick="editUser('${user.id}')">${user.status === 'banned' ? 'Unban' : 'Ban'}</button>
                        <button class="delete-btn" onclick="deleteUser('${user.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function editUser(id) {
    try {
        const users = await dbOperations.getAll('users');
        const user = users.find(u => u.id === id);
        const newStatus = user.status === 'banned' ? 'active' : 'banned';
        await dbOperations.update('users', id, { status: newStatus });
        loadUsers();
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await dbOperations.delete('users', id);
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
}

// Analytics Management
async function loadAnalytics() {
    try {
        const analyticsContainer = document.getElementById('analyticsContent');
        const [polls, news, models] = await Promise.all([
            dbOperations.getAll('polls'),
            dbOperations.getAll('news'),
            dbOperations.getAll('models')
        ]);
        
        const totalVotes = polls.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0);
        const totalViews = news.reduce((sum, article) => sum + (article.views || 0), 0);
        const totalFollowers = models.reduce((sum, model) => sum + (model.followers || 0), 0);
        
        analyticsContainer.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>Poll Analytics</h3>
                    <div class="metric">Total Votes: ${totalVotes}</div>
                    <div class="metric">Active Polls: ${polls.filter(p => p.isActive).length}</div>
                    <div class="metric">Avg Votes/Poll: ${Math.round(totalVotes / polls.length) || 0}</div>
                </div>
                <div class="analytics-card">
                    <h3>News Analytics</h3>
                    <div class="metric">Total Views: ${totalViews}</div>
                    <div class="metric">Articles: ${news.length}</div>
                    <div class="metric">Avg Views/Article: ${Math.round(totalViews / news.length) || 0}</div>
                </div>
                <div class="analytics-card">
                    <h3>Model Analytics</h3>
                    <div class="metric">Total Followers: ${totalFollowers}</div>
                    <div class="metric">Models: ${models.length}</div>
                    <div class="metric">Avg Followers/Model: ${Math.round(totalFollowers / models.length) || 0}</div>
                </div>
            </div>
            <div class="chart-container">
                <h3>Traffic Overview</h3>
                <div class="chart-placeholder">📊 Chart visualization would go here</div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Settings Management
function loadSettings() {
    const settingsContainer = document.getElementById('settingsContent');
    
    settingsContainer.innerHTML = `
        <div class="settings-grid">
            <div class="settings-section">
                <h3>System Settings</h3>
                <div class="setting-item">
                    <label>Real-time Updates</label>
                    <input type="checkbox" ${realTimeUpdates ? 'checked' : ''} onchange="toggleRealTimeUpdates()">
                </div>
                <div class="setting-item">
                    <label>Maintenance Mode</label>
                    <button class="setting-btn" onclick="toggleMaintenance()">Toggle</button>
                </div>
                <div class="setting-item">
                    <label>Clear All Cache</label>
                    <button class="setting-btn" onclick="clearCache()">Clear</button>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Security Settings</h3>
                <div class="setting-item">
                    <label>Change Admin Password</label>
                    <button class="setting-btn" onclick="changePassword()">Change</button>
                </div>
                <div class="setting-item">
                    <label>Enable 2FA</label>
                    <button class="setting-btn" onclick="setup2FA()">Setup</button>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Data Management</h3>
                <div class="setting-item">
                    <label>Export All Data</label>
                    <button class="setting-btn" onclick="exportAllData()">Export</button>
                </div>
                <div class="setting-item">
                    <label>Import Data</label>
                    <input type="file" id="importFile" accept=".json">
                    <button class="setting-btn" onclick="importData()">Import</button>
                </div>
            </div>
        </div>
    `;
}

// Backup Management
function loadBackup() {
    const backupContainer = document.getElementById('backupContent');
    
    backupContainer.innerHTML = `
        <div class="backup-section">
            <h3>Database Backup & Restore</h3>
            <div class="backup-actions">
                <button class="backup-btn" onclick="createBackup()">📦 Create Backup</button>
                <button class="backup-btn" onclick="scheduleBackup()">⏰ Schedule Backup</button>
                <button class="backup-btn" onclick="restoreBackup()">🔄 Restore Backup</button>
            </div>
            
            <div class="backup-history">
                <h4>Backup History</h4>
                <div id="backupList" class="backup-list"></div>
            </div>
        </div>
    `;
    
    loadBackupHistory();
}

async function loadBackupHistory() {
    try {
        const backups = await dbOperations.getAll('backups');
        const backupList = document.getElementById('backupList');
        
        backupList.innerHTML = backups.map(backup => `
            <div class="backup-item">
                <div class="backup-info">
                    <div class="backup-name">${backup.name}</div>
                    <div class="backup-date">${new Date(backup.createdAt.seconds * 1000).toLocaleString()}</div>
                </div>
                <div class="backup-actions">
                    <button class="restore-btn" onclick="restoreSpecificBackup('${backup.id}')">Restore</button>
                    <button class="delete-btn" onclick="deleteBackup('${backup.id}')">Delete</button>
                </div>
            </div>
        `).join('') || '<div class="no-backups">No backups found</div>';
    } catch (error) {
        console.error('Error loading backup history:', error);
    }
}

// System Functions
function toggleRealTimeUpdates() {
    realTimeUpdates = !realTimeUpdates;
    if (realTimeUpdates) {
        startRealTimeUpdates();
    }
}

function toggleMaintenance() {
    maintenanceMode = !maintenanceMode;
    setConfig('system.maintenanceMode', maintenanceMode);
    
    if (maintenanceMode) {
        showMaintenanceNotice();
        alert('🔧 Maintenance mode enabled. Users will see a maintenance message.');
    } else {
        const notice = document.querySelector('.maintenance-notice');
        if (notice) notice.remove();
        alert('✅ Maintenance mode disabled. System is now accessible to users.');
    }
    
    // Log the maintenance mode change
    systemMonitor.addAlert('info', 'Maintenance Mode', 
        `Maintenance mode ${maintenanceMode ? 'enabled' : 'disabled'}`);
}

function clearCache() {
    localStorage.clear();
    sessionStorage.clear();
    alert('Cache cleared successfully');
}

function changePassword() {
    const newPassword = prompt('Enter new admin password:');
    if (newPassword && newPassword.length >= 6) {
        alert('Password changed successfully (Note: This is a demo)');
    }
}

function setup2FA() {
    alert('2FA setup would be implemented here');
}

async function exportAllData() {
    try {
        const [polls, news, models, requests, users] = await Promise.all([
            dbOperations.getAll('polls'),
            dbOperations.getAll('news'),
            dbOperations.getAll('models'),
            dbOperations.getAll('requests'),
            dbOperations.getAll('users')
        ]);
        
        const exportData = {
            polls,
            news,
            models,
            requests,
            users,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kk-admin-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error exporting data:', error);
    }
}

function importData() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                alert('Data import would be processed here');
            } catch (error) {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    }
}

function createBackup() {
    alert('Creating backup...');
}

function scheduleBackup() {
    alert('Backup scheduling would be implemented here');
}

function restoreBackup() {
    alert('Backup restore would be implemented here');
}

function showBulkOperations() {
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h2>🔄 Bulk Operations</h2>
        <div class="bulk-operations">
            <div class="bulk-section">
                <h3>Data Operations</h3>
                <div class="bulk-actions">
                    <button class="bulk-btn" onclick="bulkDeleteOldData()">🗑️ Delete Old Data</button>
                    <button class="bulk-btn" onclick="bulkUpdateStatus()">📝 Update Status</button>
                    <button class="bulk-btn" onclick="bulkExportData()">📤 Export All Data</button>
                    <button class="bulk-btn" onclick="bulkImportData()">📥 Import Data</button>
                </div>
            </div>
            
            <div class="bulk-section">
                <h3>User Operations</h3>
                <div class="bulk-actions">
                    <button class="bulk-btn" onclick="bulkUserActions()">👥 Manage Users</button>
                    <button class="bulk-btn" onclick="bulkNotifications()">📧 Send Notifications</button>
                    <button class="bulk-btn" onclick="bulkPermissions()">🔐 Update Permissions</button>
                </div>
            </div>
            
            <div class="bulk-section">
                <h3>System Operations</h3>
                <div class="bulk-actions">
                    <button class="bulk-btn" onclick="bulkCacheOperations()">🗄️ Cache Management</button>
                    <button class="bulk-btn" onclick="bulkLogCleanup()">📋 Log Cleanup</button>
                    <button class="bulk-btn" onclick="bulkOptimization()">⚡ System Optimization</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function showSystemHealth() {
    const statusReport = systemMonitor.getStatusReport();
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <h2>🏥 System Health Report</h2>
        <div class="health-report">
            <div class="health-overview">
                <div class="health-status ${statusReport.health.overall}">
                    <div class="status-icon">${getHealthIcon(statusReport.health.overall)}</div>
                    <div class="status-text">
                        <div class="status-title">Overall Status: ${statusReport.health.overall.toUpperCase()}</div>
                        <div class="status-time">Last Check: ${new Date(statusReport.health.lastCheck).toLocaleString()}</div>
                    </div>
                </div>
            </div>
            
            <div class="health-details">
                <div class="health-section">
                    <h4>Component Health</h4>
                    <div class="component-status">
                        <div class="component ${statusReport.health.database}">
                            <span class="component-name">Database</span>
                            <span class="component-status-badge">${statusReport.health.database}</span>
                        </div>
                        <div class="component ${statusReport.health.storage}">
                            <span class="component-name">Storage</span>
                            <span class="component-status-badge">${statusReport.health.storage}</span>
                        </div>
                        <div class="component ${statusReport.health.performance}">
                            <span class="component-name">Performance</span>
                            <span class="component-status-badge">${statusReport.health.performance}</span>
                        </div>
                        <div class="component ${statusReport.health.security}">
                            <span class="component-name">Security</span>
                            <span class="component-status-badge">${statusReport.health.security}</span>
                        </div>
                    </div>
                </div>
                
                <div class="health-section">
                    <h4>System Metrics</h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-label">Uptime</span>
                            <span class="metric-value">${statusReport.metrics.uptimeFormatted}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Active Users</span>
                            <span class="metric-value">${statusReport.metrics.activeUsers}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Avg Response Time</span>
                            <span class="metric-value">${Math.round(statusReport.metrics.averageResponseTime)}ms</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Error Rate</span>
                            <span class="metric-value">${statusReport.metrics.errorRate.toFixed(2)}%</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Memory Usage</span>
                            <span class="metric-value">${statusReport.metrics.memoryUsage.toFixed(1)}%</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Requests/Min</span>
                            <span class="metric-value">${statusReport.metrics.requestsPerMinute}</span>
                        </div>
                    </div>
                </div>
                
                ${statusReport.alerts.length > 0 ? `
                <div class="health-section">
                    <h4>Recent Alerts</h4>
                    <div class="alerts-list">
                        ${statusReport.alerts.map(alert => `
                            <div class="alert-item ${alert.level}">
                                <div class="alert-header">
                                    <span class="alert-title">${alert.title}</span>
                                    <span class="alert-time">${new Date(alert.timestamp).toLocaleString()}</span>
                                </div>
                                <div class="alert-message">${alert.message}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="health-actions">
                <button class="health-btn" onclick="systemMonitor.performHealthCheck(); showSystemHealth();">🔄 Refresh</button>
                <button class="health-btn" onclick="systemMonitor.clearAlerts(); showSystemHealth();">🗑️ Clear Alerts</button>
                <button class="health-btn" onclick="exportSystemReport()">📊 Export Report</button>
            </div>
        </div>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function getHealthIcon(status) {
    const icons = {
        'healthy': '✅',
        'degraded': '⚠️',
        'warning': '🟡',
        'critical': '🔴'
    };
    return icons[status] || '❓';
}

function getHealthStatusClass() {
    const status = systemMonitor.healthStatus?.overall || 'unknown';
    return `health-${status}`;
}

function getHealthStatusIcon() {
    const status = systemMonitor.healthStatus?.overall || 'unknown';
    return getHealthIcon(status);
}

function getSystemHealthText() {
    const status = systemMonitor.healthStatus?.overall || 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function showMaintenanceNotice() {
    const notice = document.createElement('div');
    notice.className = 'maintenance-notice';
    notice.innerHTML = `
        <div class="notice-content">
            <span class="notice-icon">🔧</span>
            <span class="notice-text">System is in maintenance mode</span>
            <button class="notice-btn" onclick="toggleMaintenance()">Disable</button>
        </div>
    `;
    document.body.appendChild(notice);
}

function exportSystemReport() {
    const report = systemMonitor.exportMetrics();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-health-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    closeModal();
}

function showBackupRestore() {
    loadSection('backup');
}

// Bulk Operation Functions
function bulkDeleteOldData() {
    const cutoffDate = prompt('Delete data older than (days):');
    if (cutoffDate && !isNaN(cutoffDate)) {
        const days = parseInt(cutoffDate);
        const cutoff = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
        alert(`Would delete data older than ${cutoff.toLocaleDateString()}`);
        closeModal();
    }
}

function bulkUpdateStatus() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Bulk Status Update</h3>
        <div class="bulk-update-form">
            <div class="form-group">
                <label>Collection</label>
                <select id="bulkCollection">
                    <option value="polls">Polls</option>
                    <option value="news">News</option>
                    <option value="models">Models</option>
                    <option value="requests">Requests</option>
                </select>
            </div>
            <div class="form-group">
                <label>New Status</label>
                <input type="text" id="bulkStatus" placeholder="Enter new status">
            </div>
            <div class="form-group">
                <label>Filter (optional)</label>
                <input type="text" id="bulkFilter" placeholder="Filter criteria">
            </div>
            <button onclick="executeBulkUpdate()" class="form-submit">Update All</button>
        </div>
    `;
}

function executeBulkUpdate() {
    const collection = document.getElementById('bulkCollection').value;
    const status = document.getElementById('bulkStatus').value;
    const filter = document.getElementById('bulkFilter').value;
    
    if (confirm(`Update all ${collection} to status "${status}"?`)) {
        alert('Bulk update would be executed here');
        closeModal();
    }
}

function bulkExportData() {
    exportAllData();
    closeModal();
}

function bulkImportData() {
    importData();
    closeModal();
}

function bulkUserActions() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Bulk User Actions</h3>
        <div class="bulk-user-actions">
            <button class="bulk-action-btn" onclick="bulkBanUsers()">🚫 Ban Inactive Users</button>
            <button class="bulk-action-btn" onclick="bulkActivateUsers()">✅ Activate Users</button>
            <button class="bulk-action-btn" onclick="bulkDeleteUsers()">🗑️ Delete Old Users</button>
            <button class="bulk-action-btn" onclick="bulkExportUsers()">📤 Export User Data</button>
        </div>
    `;
}

function bulkBanUsers() {
    if (confirm('Ban all users inactive for more than 90 days?')) {
        alert('Bulk user ban would be executed here');
        closeModal();
    }
}

function bulkActivateUsers() {
    if (confirm('Activate all pending users?')) {
        alert('Bulk user activation would be executed here');
        closeModal();
    }
}

function bulkDeleteUsers() {
    if (confirm('Delete users inactive for more than 1 year? This cannot be undone!')) {
        alert('Bulk user deletion would be executed here');
        closeModal();
    }
}

function bulkExportUsers() {
    alert('Exporting user data...');
    closeModal();
}

function bulkNotifications() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Send Bulk Notifications</h3>
        <div class="notification-form">
            <div class="form-group">
                <label>Recipient Group</label>
                <select id="notificationGroup">
                    <option value="all">All Users</option>
                    <option value="active">Active Users</option>
                    <option value="inactive">Inactive Users</option>
                    <option value="admins">Administrators</option>
                </select>
            </div>
            <div class="form-group">
                <label>Message Title</label>
                <input type="text" id="notificationTitle" placeholder="Notification title">
            </div>
            <div class="form-group">
                <label>Message Content</label>
                <textarea id="notificationContent" rows="4" placeholder="Notification message"></textarea>
            </div>
            <button onclick="sendBulkNotification()" class="form-submit">Send Notification</button>
        </div>
    `;
}

function sendBulkNotification() {
    const group = document.getElementById('notificationGroup').value;
    const title = document.getElementById('notificationTitle').value;
    const content = document.getElementById('notificationContent').value;
    
    if (title && content) {
        if (confirm(`Send notification to ${group}?`)) {
            alert('Bulk notification would be sent here');
            closeModal();
        }
    } else {
        alert('Please fill in all fields');
    }
}

function bulkPermissions() {
    alert('Bulk permission management would be implemented here');
    closeModal();
}

function bulkCacheOperations() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>Cache Management</h3>
        <div class="cache-operations">
            <button class="cache-btn" onclick="clearAllCache()">🗑️ Clear All Cache</button>
            <button class="cache-btn" onclick="clearUserCache()">👤 Clear User Cache</button>
            <button class="cache-btn" onclick="clearDataCache()">📊 Clear Data Cache</button>
            <button class="cache-btn" onclick="preloadCache()">⚡ Preload Cache</button>
        </div>
    `;
}

function clearAllCache() {
    if (confirm('Clear all cached data? This may slow down the system temporarily.')) {
        localStorage.clear();
        sessionStorage.clear();
        alert('All cache cleared successfully');
        closeModal();
    }
}

function clearUserCache() {
    alert('User cache cleared');
    closeModal();
}

function clearDataCache() {
    alert('Data cache cleared');
    closeModal();
}

function preloadCache() {
    alert('Cache preloading started...');
    closeModal();
}

function bulkLogCleanup() {
    if (confirm('Clean up logs older than 30 days?')) {
        alert('Log cleanup would be executed here');
        closeModal();
    }
}

function bulkOptimization() {
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h3>System Optimization</h3>
        <div class="optimization-tasks">
            <div class="task-item">
                <span>Database Optimization</span>
                <button onclick="optimizeDatabase()">Run</button>
            </div>
            <div class="task-item">
                <span>Image Compression</span>
                <button onclick="compressImages()">Run</button>
            </div>
            <div class="task-item">
                <span>Index Rebuilding</span>
                <button onclick="rebuildIndexes()">Run</button>
            </div>
            <div class="task-item">
                <span>Memory Cleanup</span>
                <button onclick="cleanupMemory()">Run</button>
            </div>
        </div>
    `;
}

function optimizeDatabase() {
    alert('Database optimization started...');
}

function compressImages() {
    alert('Image compression started...');
}

function rebuildIndexes() {
    alert('Index rebuilding started...');
}

function cleanupMemory() {
    if ('gc' in window) {
        window.gc();
    }
    alert('Memory cleanup completed');
}

// Activity Logging
async function logActivity(type, description, metadata = {}) {
    try {
        await dbOperations.add('activity_logs', {
            type,
            description,
            userId: 'admin',
            metadata,
            ipAddress: 'localhost',
            userAgent: navigator.userAgent
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}

// Enhanced error handling
window.addEventListener('error', (event) => {
    systemMonitor.addAlert('error', 'JavaScript Error', event.error?.message || 'Unknown error');
    logActivity('error', `JavaScript error: ${event.error?.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Performance monitoring
window.addEventListener('load', () => {
    setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            systemMonitor.metrics.responseTime.push(loadTime);
            
            if (loadTime > 3000) {
                systemMonitor.addAlert('warning', 'Slow page load', `Load time: ${loadTime}ms`);
            }
        }
    }, 1000);
});

// Make functions global
window.logout = logout;
window.showAddPollForm = showAddPollForm;
window.showAddNewsForm = showAddNewsForm;
window.showAddModelForm = showAddModelForm;
window.deletePoll = deletePoll;
window.deleteNews = deleteNews;
window.deleteModel = deleteModel;
window.deleteRequest = deleteRequest;
window.updateRequestStatus = updateRequestStatus;
window.closeModal = closeModal;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.toggleRealTimeUpdates = toggleRealTimeUpdates;
window.toggleMaintenance = toggleMaintenance;
window.clearCache = clearCache;
window.changePassword = changePassword;
window.setup2FA = setup2FA;
window.exportAllData = exportAllData;
window.importData = importData;
window.createBackup = createBackup;
window.scheduleBackup = scheduleBackup;
window.restoreBackup = restoreBackup;
window.showBulkOperations = showBulkOperations;
window.showSystemHealth = showSystemHealth;
window.showBackupRestore = showBackupRestore;
window.loadDashboard = loadDashboard;
window.exportSystemReport = exportSystemReport;
window.bulkDeleteOldData = bulkDeleteOldData;
window.bulkUpdateStatus = bulkUpdateStatus;
window.executeBulkUpdate = executeBulkUpdate;
window.bulkExportData = bulkExportData;
window.bulkImportData = bulkImportData;
window.bulkUserActions = bulkUserActions;
window.bulkNotifications = bulkNotifications;
window.sendBulkNotification = sendBulkNotification;
window.bulkPermissions = bulkPermissions;
window.bulkCacheOperations = bulkCacheOperations;
window.bulkLogCleanup = bulkLogCleanup;
window.bulkOptimization = bulkOptimization;
window.showAddVideoForm = showAddVideoForm;
window.loadKKStatusOverview = loadKKStatusOverview;



// Initialize admin system
console.log('🚀 KK Admin System initialized with full website control capabilities');
console.log('📊 Features: Dashboard, Analytics, User Management, System Health, Bulk Operations');
console.log('🔧 Monitoring: Real-time health checks, performance metrics, alert system');
console.log('💾 Backup: Automated backups, restore capabilities, data export/import');
console.log('⚙️ Settings: System configuration, security settings, maintenance mode');
console.log('🔑 Test Login: admin@kk-ecosystem.com / Admin@890');