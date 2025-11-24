let adminData = { groups: [], posts: [], users: {} };
let currentEditId = null;
let allPosts = [];
let allGroups = [];

document.addEventListener('DOMContentLoaded', async function() {
    await loadAdminData();
    updateStats();
    loadGroupsTable();
    loadPostsTable();
    loadUsersTable();
});

async function loadAdminData() {
    console.log('Loading admin data...');
    try {
        adminData = await window.getDataFromFirebase();
        console.log('Admin data loaded:', adminData);
    } catch (error) {
        console.error('Error loading admin data:', error);
        adminData = { groups: [], posts: [], users: {} };
    }
}

function updateStats() {
    document.getElementById('totalGroups').textContent = adminData.groups.length;
    document.getElementById('totalPosts').textContent = adminData.posts.length;
    document.getElementById('totalUsers').textContent = Object.keys(adminData.users).length;
}

function showTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function loadGroupsTable(groups = null) {
    const groupsToShow = groups || adminData.groups;
    allGroups = adminData.groups;
    const tbody = document.querySelector('#groupsTable tbody');
    tbody.innerHTML = groupsToShow.map(group => {
        const postCount = adminData.posts.filter(p => p.groupId === group.id).length;
        return `
            <tr>
                <td>${group.id}</td>
                <td>${group.name}</td>
                <td>${group.section}</td>
                <td>${group.category}</td>
                <td>${group.creator}</td>
                <td>${postCount}</td>
                <td>
                    <button class="btn btn-warning" onclick="editGroup('${group.id}')">Edit</button>
                    <button class="btn btn-primary" onclick="viewGroupPosts(${group.id})">View Posts</button>
                    <button class="btn btn-danger" onclick="deleteGroup('${group.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Only populate filters on initial load
    if (!groups) {
        const groupFilter = document.getElementById('groupFilter');
        if (groupFilter) {
            groupFilter.innerHTML = '<option value="">All Groups</option>' + 
                adminData.groups.map(group => `<option value="${group.id}">${group.name}</option>`).join('');
        }
        
        const categoryFilter = document.getElementById('groupCategoryFilter');
        if (categoryFilter) {
            const categories = [...new Set(adminData.groups.map(g => g.category).filter(c => c))];
            categoryFilter.innerHTML = '<option value="">All Categories</option>' + 
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
    }
}

function filterGroups() {
    const selectedCategory = document.getElementById('groupCategoryFilter').value;
    if (!selectedCategory || selectedCategory === '') {
        loadGroupsTable(adminData.groups);
    } else {
        const filteredGroups = adminData.groups.filter(group => group.category === selectedCategory);
        loadGroupsTable(filteredGroups);
    }
}

function loadPostsTable(posts = null) {
    const postsToShow = posts || adminData.posts;
    allPosts = adminData.posts;
    const tbody = document.querySelector('#postsTable tbody');
    tbody.innerHTML = postsToShow.map(post => {
        const group = adminData.groups.find(g => g.id === post.groupId);
        const truncatedContent = post.content.replace(/<[^>]*>/g, '').substring(0, 50) + '...';
        return `
            <tr>
                <td>${post.id}</td>
                <td>${post.author}</td>
                <td>${group ? group.name : 'Unknown'}</td>
                <td>${truncatedContent}</td>
                <td>${post.mediaUrl ? '📎' : '-'}</td>
                <td>${new Date(post.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-warning" onclick="editPost('${post.id}')">Edit</button>
                    <button class="btn btn-primary" onclick="viewPost('${post.id}')">View</button>
                    <button class="btn btn-danger" onclick="deletePost('${post.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterPosts() {
    const selectedGroup = document.getElementById('groupFilter').value;
    if (!selectedGroup) {
        loadPostsTable(adminData.posts);
    } else {
        const filteredPosts = adminData.posts.filter(post => post.groupId == selectedGroup);
        loadPostsTable(filteredPosts);
    }
}

function loadUsersTable() {
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = Object.values(adminData.users).map(user => {
        return `
            <tr>
                <td>${user.username}</td>
                <td>${user.postCount || 0}</td>
                <td>${user.badges || 0}</td>
                <td>${user.reactions || 0}</td>
                <td>${new Date(user.joinedDate).toLocaleDateString()}</td>
                <td>${user.isStaff ? '👑' : '-'}</td>
                <td>
                    <button class="btn btn-warning" onclick="editUser('${user.username}')">Edit</button>
                    <button class="btn btn-primary" onclick="toggleStaff('${user.username}')">${user.isStaff ? 'Remove Staff' : 'Make Staff'}</button>
                    <button class="btn btn-danger" onclick="deleteUser('${user.username}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewGroupPosts(groupId) {
    const group = adminData.groups.find(g => g.id === groupId);
    const posts = adminData.posts.filter(p => p.groupId === groupId);
    
    alert(`Group: ${group.name}\nPosts: ${posts.length}\n\nRecent posts:\n${posts.slice(0, 5).map(p => `- ${p.author}: ${p.content.replace(/<[^>]*>/g, '').substring(0, 30)}...`).join('\n')}`);
}

function viewPost(postId) {
    const post = adminData.posts.find(p => p.id == postId);
    const group = adminData.groups.find(g => g.id === post.groupId);
    
    alert(`Post ID: ${post.id}\nAuthor: ${post.author}\nGroup: ${group ? group.name : 'Unknown'}\nDate: ${new Date(post.createdAt).toLocaleString()}\n\nContent:\n${post.content.replace(/<[^>]*>/g, '')}\n\nMedia: ${post.mediaUrl || 'None'}`);
}

async function deleteGroup(groupId) {
    if (!confirm('Are you sure you want to delete this group? This will also delete all posts in this group.')) return;
    
    try {
        console.log('Deleting group:', groupId);
        
        // Delete group posts first
        const groupPosts = adminData.posts.filter(p => p.groupId == groupId);
        console.log('Found posts to delete:', groupPosts.length);
        
        for (const post of groupPosts) {
            console.log('Deleting post:', post.id);
            await window.deletePostFromFirebase(post.id);
        }
        
        // Delete group
        console.log('Deleting group document:', groupId);
        await window.deleteGroupFromFirebase(groupId);
        
        alert('Group and all its posts deleted successfully!');
        await loadAdminData();
        updateStats();
        loadGroupsTable();
        loadPostsTable();
    } catch (error) {
        console.error('Delete group error:', error);
        alert('Error deleting group: ' + error.message);
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
        await window.deletePostFromFirebase(postId);
        alert('Post deleted successfully!');
        await loadAdminData();
        updateStats();
        loadPostsTable();
    } catch (error) {
        alert('Error deleting post: ' + error.message);
    }
}

async function deleteUser(username) {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their posts.')) return;
    
    try {
        // Delete user posts first
        const userPosts = adminData.posts.filter(p => p.author === username);
        for (const post of userPosts) {
            await window.deletePostFromFirebase(post.id);
        }
        
        // Delete user
        await window.deleteUserFromFirebase(username);
        
        alert('User and all their posts deleted successfully!');
        await loadAdminData();
        updateStats();
        loadUsersTable();
        loadPostsTable();
        loadGroupsTable();
    } catch (error) {
        alert('Error deleting user: ' + error.message);
    }
}

async function toggleStaff(username) {
    try {
        const user = adminData.users[username];
        await window.updateUserStaffStatus(username, !user.isStaff);
        
        alert(`${username} ${user.isStaff ? 'removed from' : 'added to'} staff successfully!`);
        await loadAdminData();
        loadUsersTable();
    } catch (error) {
        alert('Error updating staff status: ' + error.message);
    }
}

// Edit Functions
function editGroup(groupId) {
    const group = adminData.groups.find(g => g.id == groupId);
    if (!group) return;
    
    currentEditId = groupId;
    document.getElementById('editGroupName').value = group.name || '';
    document.getElementById('editGroupDescription').value = group.description || '';
    document.getElementById('editGroupCategory').value = group.category || '';
    document.getElementById('editGroupAdminOnly').value = group.adminOnly ? 'true' : 'false';
    
    document.getElementById('editGroupModal').style.display = 'block';
}

function editPost(postId) {
    const post = adminData.posts.find(p => p.id == postId);
    if (!post) return;
    
    currentEditId = postId;
    document.getElementById('editPostContent').value = post.content.replace(/<[^>]*>/g, '') || '';
    document.getElementById('editPostMediaUrl').value = post.mediaUrl || '';
    
    document.getElementById('editPostModal').style.display = 'block';
}

function editUser(username) {
    const user = adminData.users[username];
    if (!user) return;
    
    currentEditId = username;
    document.getElementById('editUserUsername').value = username;
    document.getElementById('editUserProfileUrl').value = user.profileUrl || '';
    document.getElementById('editUserStaffStatus').value = user.isStaff ? 'true' : 'false';
    
    document.getElementById('editUserModal').style.display = 'block';
}

// Save Functions
async function saveGroupEdit() {
    if (!currentEditId) return;
    
    const updatedGroup = {
        name: document.getElementById('editGroupName').value,
        description: document.getElementById('editGroupDescription').value,
        category: document.getElementById('editGroupCategory').value,
        adminOnly: document.getElementById('editGroupAdminOnly').value === 'true'
    };
    
    try {
        await window.updateGroupInFirebase(currentEditId, updatedGroup);
        closeModal('editGroupModal');
        await loadAdminData();
        updateStats();
        loadGroupsTable();
        alert('Group updated successfully!');
    } catch (error) {
        alert('Failed to update group: ' + error.message);
    }
}

async function savePostEdit() {
    if (!currentEditId) return;
    
    const updatedPost = {
        content: document.getElementById('editPostContent').value,
        mediaUrl: document.getElementById('editPostMediaUrl').value || null
    };
    
    try {
        await window.updatePostInFirebase(currentEditId, updatedPost);
        closeModal('editPostModal');
        await loadAdminData();
        loadPostsTable();
        alert('Post updated successfully!');
    } catch (error) {
        alert('Failed to update post: ' + error.message);
    }
}

async function saveUserEdit() {
    if (!currentEditId) return;
    
    const newUsername = document.getElementById('editUserUsername').value;
    const updatedUser = {
        profileUrl: document.getElementById('editUserProfileUrl').value || null,
        isStaff: document.getElementById('editUserStaffStatus').value === 'true'
    };
    
    try {
        if (newUsername !== currentEditId) {
            await window.updateUserUsernameInFirebase(currentEditId, newUsername, updatedUser);
        } else {
            await window.updateUserInFirebase(currentEditId, updatedUser);
        }
        closeModal('editUserModal');
        await loadAdminData();
        updateStats();
        loadUsersTable();
        loadPostsTable();
        alert('User updated successfully!');
    } catch (error) {
        alert('Failed to update user: ' + error.message);
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    currentEditId = null;
}

function showAddGroupForm() {
    document.getElementById('addGroupName').value = '';
    document.getElementById('addGroupDescription').value = '';
    document.getElementById('addGroupSection').value = '';
    document.getElementById('addGroupCategory').innerHTML = '<option value="">Select Category</option>';
    document.getElementById('addGroupCreator').value = '';
    document.getElementById('addGroupAdminOnly').value = 'false';
    document.getElementById('addGroupPinned').value = 'false';
    document.getElementById('pinOrderGroup').style.display = 'none';
    updatePinOrderOptions();
    document.getElementById('addGroupModal').style.display = 'block';
}

function updateCategoryOptions() {
    const section = document.getElementById('addGroupSection').value;
    const categorySelect = document.getElementById('addGroupCategory');
    
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    if (section === 'forums') {
        const forumCategories = ['Contests', 'Videos', 'Images', 'General'];
        forumCategories.forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    } else if (section === 'threads') {
        const threadCategories = ["What's New", 'New Posts', 'New Items', 'Latest Activity'];
        threadCategories.forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    }
    
    updatePinOrderOptions();
}

function togglePinOrder() {
    const isPinned = document.getElementById('addGroupPinned').value === 'true';
    const pinOrderGroup = document.getElementById('pinOrderGroup');
    
    if (isPinned) {
        pinOrderGroup.style.display = 'block';
        updatePinOrderOptions();
    } else {
        pinOrderGroup.style.display = 'none';
    }
}

function updatePinOrderOptions() {
    const section = document.getElementById('addGroupSection').value;
    const category = document.getElementById('addGroupCategory').value;
    const pinOrderSelect = document.getElementById('addGroupPinOrder');
    
    pinOrderSelect.innerHTML = '<option value="">Select Pin Order</option>';
    
    if (section && category) {
        // Get existing pin orders for this section/category combination
        const existingPinOrders = adminData.groups
            .filter(g => g.section === section && g.category === category && g.pinned && g.pinOrder)
            .map(g => parseInt(g.pinOrder));
        
        console.log('Existing pin orders:', existingPinOrders);
        
        // Generate pin order options (1-3)
        for (let i = 1; i <= 3; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            
            if (existingPinOrders.includes(i)) {
                option.disabled = true;
                option.style.color = '#999';
                option.textContent += ' (Used)';
            }
            
            pinOrderSelect.appendChild(option);
        }
    }
}

async function saveNewGroup() {
    const selectedCategory = document.getElementById('addGroupCategory').value;
    const section = document.getElementById('addGroupSection').value;
    
    // Map display categories to database values
    let dbCategory = selectedCategory;
    if (section === 'forums' && selectedCategory === 'Images') {
        dbCategory = 'photo';
    } else if (section === 'threads') {
        const threadMapping = {
            "What's New": 'new',
            'New Posts': 'post',
            'New Items': 'items',
            'Latest Activity': 'activity'
        };
        dbCategory = threadMapping[selectedCategory] || selectedCategory;
    }
    
    const newGroup = {
        name: document.getElementById('addGroupName').value,
        description: document.getElementById('addGroupDescription').value,
        section: section,
        category: dbCategory,
        creator: document.getElementById('addGroupCreator').value,
        adminOnly: document.getElementById('addGroupAdminOnly').value === 'true',
        pinned: document.getElementById('addGroupPinned').value === 'true',
        pinOrder: document.getElementById('addGroupPinned').value === 'true' ? 
                 parseInt(document.getElementById('addGroupPinOrder').value) || null : null
    };
    
    if (!newGroup.name || !newGroup.creator || !newGroup.section || !selectedCategory) {
        alert('Name, Creator, Section, and Category are required fields!');
        return;
    }
    
    if (newGroup.pinned && !newGroup.pinOrder) {
        alert('Pin Order is required when group is pinned!');
        return;
    }
    
    try {
        await window.addGroupToFirebase(newGroup);
        closeModal('addGroupModal');
        await loadAdminData();
        updateStats();
        loadGroupsTable();
        alert('Group added successfully!');
    } catch (error) {
        alert('Failed to add group: ' + error.message);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        currentEditId = null;
    }
}

// Keyboard support
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                currentEditId = null;
            }
        });
    }
});