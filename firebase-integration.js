// Firebase Integration for KKfakes Admin
import { collection, getDocs, getDoc, doc, updateDoc, deleteDoc, query, orderBy, setDoc, where, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Get data from Firebase
window.getDataFromFirebase = async function() {
    try {
        console.log('Fetching Firebase data...');
        const db = window.db;
        
        const groupsSnapshot = await getDocs(collection(db, 'groups'));
        const groups = groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const postsSnapshot = await getDocs(collection(db, 'posts'));
        const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = {};
        usersSnapshot.docs.forEach(doc => {
            users[doc.id] = { username: doc.id, ...doc.data() };
        });
        
        console.log('Data loaded:', { groups: groups.length, posts: posts.length, users: Object.keys(users).length });
        return { groups, posts, users };
    } catch (error) {
        console.error('Firebase error:', error);
        return { groups: [], posts: [], users: {} };
    }
};

// Update group in Firebase
window.updateGroupInFirebase = async function(groupId, updatedData) {
    try {
        const db = window.db;
        const groupRef = doc(db, 'groups', String(groupId));
        
        // Check if document exists first
        const groupDoc = await getDoc(groupRef);
        if (!groupDoc.exists()) {
            // Create the document if it doesn't exist
            await setDoc(groupRef, {
                id: groupId,
                ...updatedData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } else {
            await updateDoc(groupRef, {
                ...updatedData,
                updatedAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error updating group:', error);
        throw error;
    }
};

// Update post in Firebase
window.updatePostInFirebase = async function(postId, updatedData) {
    try {
        const db = window.db;
        const postRef = doc(db, 'posts', String(postId));
        
        const postDoc = await getDoc(postRef);
        if (!postDoc.exists()) {
            await setDoc(postRef, {
                id: postId,
                ...updatedData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } else {
            await updateDoc(postRef, {
                ...updatedData,
                updatedAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
};

// Update user in Firebase
window.updateUserInFirebase = async function(username, updatedData) {
    try {
        const db = window.db;
        const userRef = doc(db, 'users', String(username));
        
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                username: username,
                ...updatedData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } else {
            await updateDoc(userRef, {
                ...updatedData,
                updatedAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// Update user staff status
window.updateUserStaffStatus = async function(username, isStaff) {
    try {
        const db = window.db;
        const userRef = doc(db, 'users', String(username));
        
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                username: username,
                isStaff: isStaff,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } else {
            await updateDoc(userRef, {
                isStaff: isStaff,
                updatedAt: new Date()
            });
        }
    } catch (error) {
        console.error('Error updating user staff status:', error);
        throw error;
    }
};

// Delete group from Firebase
window.deleteGroupFromFirebase = async function(groupId) {
    try {
        const db = window.db;
        const groupRef = doc(db, 'groups', String(groupId));
        const groupDoc = await getDoc(groupRef);
        if (groupDoc.exists()) {
            await deleteDoc(groupRef);
        } else {
            console.warn('Group document does not exist:', groupId);
        }
    } catch (error) {
        console.error('Error deleting group:', error);
        throw error;
    }
};

// Delete post from Firebase
window.deletePostFromFirebase = async function(postId) {
    try {
        const db = window.db;
        const postRef = doc(db, 'posts', String(postId));
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
            await deleteDoc(postRef);
        } else {
            console.warn('Post document does not exist:', postId);
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
};

// Delete user from Firebase
window.deleteUserFromFirebase = async function(username) {
    try {
        const db = window.db;
        const userRef = doc(db, 'users', String(username));
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            await deleteDoc(userRef);
        } else {
            console.warn('User document does not exist:', username);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// Update username in Firebase
window.updateUserUsernameInFirebase = async function(oldUsername, newUsername, updatedData) {
    try {
        const db = window.db;
        
        // Get old user data
        const oldUserRef = doc(db, 'users', oldUsername);
        const oldUserDoc = await getDoc(oldUserRef);
        
        if (oldUserDoc.exists()) {
            const userData = oldUserDoc.data();
            
            // Create new user document
            const newUserRef = doc(db, 'users', newUsername);
            await setDoc(newUserRef, {
                ...userData,
                ...updatedData,
                username: newUsername,
                updatedAt: new Date()
            });
            
            // Delete old user document
            await deleteDoc(oldUserRef);
            
            // Update posts with new username
            const postsQuery = query(collection(db, 'posts'), where('author', '==', oldUsername));
            const postsSnapshot = await getDocs(postsQuery);
            
            const updatePromises = postsSnapshot.docs.map(postDoc => {
                const postRef = doc(db, 'posts', postDoc.id);
                return updateDoc(postRef, { author: newUsername });
            });
            
            await Promise.all(updatePromises);
        }
    } catch (error) {
        console.error('Error updating username:', error);
        throw error;
    }
};

// Add new group to Firebase
window.addGroupToFirebase = async function(groupData) {
    try {
        const db = window.db;
        const docRef = await addDoc(collection(db, 'groups'), {
            ...groupData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding group:', error);
        throw error;
    }
};