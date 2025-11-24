// KKVideos Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCFierR_4gJUOo0h2szDUaKkfzPCWaEJ_M",
    authDomain: "kkvideos2.firebaseapp.com",
    projectId: "kkvideos2",
    storageBucket: "kkvideos2.firebasestorage.app",
    messagingSenderId: "79876522071",
    appId: "1:79876522071:web:839c0fc1abc7d622712312"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Disable offline persistence to avoid permission issues
db.disableNetwork().then(() => {
    return db.enableNetwork();
}).catch(() => {
    console.log('Network toggle failed, continuing anyway');
});

// Database operations for KKVideos
export const dbOperations = {
    async getAll(collection) {
        const snapshot = await db.collection(collection).orderBy('created_at', 'desc').get();
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.status !== 'deleted');
    },

    async add(collection, data) {
        const docRef = await db.collection(collection).add({
            ...data,
            created_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        return docRef.id;
    },

    async update(collection, id, data) {
        await db.collection(collection).doc(id).update(data);
    },

    async delete(collection, id) {
        // Use soft delete only since hard delete requires special permissions
        await db.collection(collection).doc(id).update({
            status: 'deleted',
            deleted_at: firebase.firestore.FieldValue.serverTimestamp()
        });
        return true;
    }
};