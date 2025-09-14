// Simple test to verify Supabase database connection
// Run this with: node test_database.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not found');
  console.log('Make sure .env.local contains:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('\n📋 SOLUTION: Run the database schema first!');
        console.log('1. Copy the contents of supabase_schema_safe.sql');
        console.log('2. Go to your Supabase dashboard → SQL Editor');
        console.log('3. Paste and run the entire schema');
        console.log('4. Then test waifu creation again');
      }
      
      return false;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test if functions exist
    const { data: funcTest, error: funcError } = await supabase.rpc('can_create_waifu', {
      user_wallet: 'test_wallet'
    });
    
    if (funcError) {
      console.log('⚠️  Database functions not found - schema may not be complete');
      console.log('Make sure to run the full supabase_schema_safe.sql');
      return false;
    }
    
    console.log('✅ Database functions working!');
    console.log('✅ Database is ready for WaifuHub!');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

testDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Your database is properly configured!');
    console.log('You can now create waifus and they will be stored in Supabase.');
  } else {
    console.log('\n🔧 Please fix the database setup and try again.');
  }
});
