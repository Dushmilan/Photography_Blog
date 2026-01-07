import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import https from 'https';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('--- Supabase Diagnostic Test ---');
console.log('Node Version:', process.version);
console.log('SUPABASE_URL:', supabaseUrl ? 'Found' : 'MISSING');
console.log('SUPABASE_KEY:', supabaseKey ? 'Found' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ ERROR: Supabase credentials missing in .env file!');
    process.exit(1);
}

// 1. Basic URL Validation
try {
    const url = new URL(supabaseUrl);
    console.log('URL Protocol:', url.protocol);
    console.log('URL Hostname:', url.hostname);
    if (!url.protocol.startsWith('http')) {
        throw new Error('URL must start with http:// or https://');
    }
} catch (e) {
    console.error('\n❌ Invalid SUPABASE_URL format:', e.message);
    process.exit(1);
}

async function runDiagnostics() {
    // 2. Raw Network Check (using https module to bypass fetch specifics)
    console.log('\n--- Step 1: Raw HTTPS Check ---');
    try {
        await new Promise((resolve, reject) => {
            const req = https.get(supabaseUrl, (res) => {
                console.log(`✅ Raw HTTPS connection successful! Status: ${res.statusCode}`);
                resolve();
            });
            req.on('error', (e) => reject(new Error(`HTTPS Module Error: ${e.message}`)));
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('HTTPS Connection Timeout (5s)'));
            });
        });
    } catch (err) {
        console.error(`❌ Raw HTTPS Check failed: ${err.message}`);
        console.log('\n💡 TIP: Check if your internet is working or if a firewall/VPN is blocking the connection.');
    }

    // 3. Native Fetch Check
    console.log('\n--- Step 2: Native Fetch Check ---');
    try {
        const response = await fetch(supabaseUrl);
        console.log(`✅ Fetch successful! Status: ${response.status}`);
    } catch (err) {
        console.error(`❌ Fetch API failed: ${err.message}`);
        if (err.cause) console.error('  Cause:', err.cause);
    }

    // 4. Supabase Client Check
    console.log('\n--- Step 3: Supabase Client Check ---');
    const supabase = createClient(supabaseUrl, supabaseKey);
    try {
        const { data, error } = await supabase.from('images').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('❌ Supabase Client Error:', error.message);
            console.log('Error details:', error);
        } else {
            console.log('✅ Supabase Client success!');
            console.log('Image count:', data);
        }
    } catch (err) {
        console.error('❌ Unexpected Supabase Client Error:', err.message);
    }
}

runDiagnostics();
