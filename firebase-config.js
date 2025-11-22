// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyC5INII9Rm3Jry7D_bE-g_DyVYSLTfNYUs",
  authDomain: "kk-ecosystem.firebaseapp.com",
  projectId: "kk-ecosystem",
  storageBucket: "kk-ecosystem.firebasestorage.app",
  messagingSenderId: "144724514564",
  appId: "1:144724514564:web:9079d944d19660ad2da251"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Admin credentials
const ADMIN_EMAIL = 'admin@kk-ecosystem.com';
const ADMIN_PASSWORD = 'Admin@890';

// Authentication operations
export const authOperations = {
  // Admin login
  async adminLogin(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user is admin
      const adminDoc = await dbOperations.getFiltered('admins', 'uid', '==', user.uid);
      if (adminDoc.length === 0) {
        await signOut(auth);
        throw new Error('Unauthorized: Admin access required');
      }
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          role: adminDoc[0].role || 'admin'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Create admin user (for initial setup)
  async createAdmin(email, password, role = 'admin') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Add admin record
      await dbOperations.add('admins', {
        uid: user.uid,
        email: user.email,
        role: role,
        permissions: role === 'superadmin' ? ['*'] : ['polls:*', 'news:*', 'models:*', 'requests:*'],
        status: 'active'
      });
      
      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          role: role
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  },

  // Auth state listener
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

// Database operations
export const dbOperations = {
  // Add document
  async add(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },

  // Get all documents
  async getAll(collectionName, orderByField = 'createdAt') {
    try {
      const q = query(collection(db, collectionName), orderBy(orderByField, 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },

  // Get documents with filter
  async getFiltered(collectionName, field, operator, value) {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting filtered documents:', error);
      throw error;
    }
  },

  // Update document
  async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete document
  async delete(collectionName, docId) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};

export { db, auth };