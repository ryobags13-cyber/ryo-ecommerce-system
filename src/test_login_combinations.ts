import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCombinations() {
  const credentials = [
    { email: 'admin@algerian-cod.com', password: 'admin123' },
    { email: 'admin@algerian-cod.com', password: 'AlgeriaCODAdmin2026!' },
    { email: 'samira.b@algerian-cod.com', password: 'admin123' },
    { email: 'samira.b@algerian-cod.com', password: 'AlgeriaCODAdmin2026!' },
    { email: 'admin@algerian-cod.com', password: 'admin' },
    { email: 'admin@algerian-cod.com', password: 'password' }
  ];

  for (const cred of credentials) {
    console.log(`Checking ${cred.email} / ${cred.password}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cred.email,
      password: cred.password
    });
    if (error) {
      console.log(`-> Failed: ${error.message}`);
    } else {
      console.log(`-> SUCCESS! Authenticated User ID:`, data.user?.id);
      break;
    }
  }
}

checkCombinations();
