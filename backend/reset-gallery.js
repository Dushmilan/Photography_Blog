// Utility script to clear image tracking from database
// Use this when switching ImageKit accounts or endpoints
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Supabase credentials missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetGallery() {
    console.log('🔄 Starting Gallery Reset...');
    console.log('⚠️  This will remove all image metadata (Public/Slideshow status) from the database.');
    console.log('📸 Your actual files in ImageKit will NOT be deleted.');

    try {
        // Delete all records from the images table
        const { count, error } = await supabase
            .from('images')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete everything

        if (error) {
            throw error;
        }

        console.log('✅ Success! Image tracking has been cleared.');
        console.log('🚀 When you refresh the Admin Gallery, it will automatically re-index your new images.');
    } catch (err) {
        console.error('❌ Error resetting gallery:', err.message);
    }
}

resetGallery();
