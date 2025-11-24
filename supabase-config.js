// Supabase Configuration
const SUPABASE_URL = 'https://kuemntplqdkimlschqap.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZW1udHBscWRraW1sc2NocWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzODEzODcsImV4cCI6MjA3ODk1NzM4N30.ON-JfNYT2K-6xO2cuQ8JhhB5XqWOo7T19dpU4UBE1HM';

// Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Initialize tables if they don't exist
async function initializeTables() {
    try {
        // Test if tables exist by trying to select from them
        await supabaseClient.from('images').select('id').limit(1);
        await supabaseClient.from('reels').select('id').limit(1);
        await supabaseClient.from('stories').select('id').limit(1);
        console.log('All tables exist');
    } catch (error) {
        console.log('Tables may not exist, but continuing anyway');
    }
}

// Call initialization
initializeTables();

// Database operations for Supabase
const supabaseOperations = {
    // Images operations
    async getImages() {
        const { data, error } = await supabaseClient
            .from('images')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async addImage(imageData) {
        // Convert tags string to array if needed
        if (imageData.tags && typeof imageData.tags === 'string') {
            imageData.tags = imageData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
        const { data, error } = await supabaseClient
            .from('images')
            .insert([imageData])
            .select();
        if (error) throw error;
        return data[0];
    },

    async updateImage(id, imageData) {
        // Convert tags string to array if needed
        if (imageData.tags && typeof imageData.tags === 'string') {
            imageData.tags = imageData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
        const { data, error } = await supabaseClient
            .from('images')
            .update(imageData)
            .eq('id', parseInt(id))
            .select();
        if (error) throw error;
        return data[0];
    },

    async deleteImage(id) {
        const { error } = await supabaseClient
            .from('images')
            .delete()
            .eq('id', parseInt(id));
        if (error) throw error;
        return true;
    },

    // Reels operations
    async getReels() {
        const { data, error } = await supabaseClient
            .from('reels')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async addReel(reelData) {
        const { data, error } = await supabaseClient
            .from('reels')
            .insert([reelData])
            .select();
        if (error) throw error;
        return data[0];
    },

    async updateReel(id, reelData) {
        const { data, error } = await supabaseClient
            .from('reels')
            .update(reelData)
            .eq('id', parseInt(id))
            .select();
        if (error) throw error;
        return data[0];
    },

    async deleteReel(id) {
        const { error } = await supabaseClient
            .from('reels')
            .delete()
            .eq('id', parseInt(id));
        if (error) throw error;
        return true;
    },

    // Stories operations
    async getStories() {
        const { data, error } = await supabaseClient
            .from('stories')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async addStory(storyData) {
        const { data, error } = await supabaseClient
            .from('stories')
            .insert([storyData])
            .select();
        if (error) throw error;
        return data[0];
    },

    async updateStory(id, storyData) {
        const { data, error } = await supabaseClient
            .from('stories')
            .update(storyData)
            .eq('id', parseInt(id))
            .select();
        if (error) throw error;
        return data[0];
    },

    async deleteStory(id) {
        const { error } = await supabaseClient
            .from('stories')
            .delete()
            .eq('id', parseInt(id));
        if (error) throw error;
        return true;
    },

    // Story pages operations
    async getStoryPages(storyId) {
        const { data, error } = await supabaseClient
            .from('story_pages')
            .select('*')
            .eq('story_id', storyId)
            .order('page_number', { ascending: true });
        if (error) throw error;
        return data;
    },

    async addStoryPage(pageData) {
        const { data, error } = await supabaseClient
            .from('story_pages')
            .insert([pageData])
            .select();
        if (error) throw error;
        return data[0];
    },

    async updateStoryPage(id, pageData) {
        const { data, error } = await supabaseClient
            .from('story_pages')
            .update(pageData)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async deleteStoryPage(id) {
        const { error } = await supabaseClient
            .from('story_pages')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
};