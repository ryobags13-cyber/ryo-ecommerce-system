import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuth() {
  const email = 'algeria.cod.admin@gmail.com';
  const password = 'AlgeriaCODAdmin2026!';
  
  console.log(`Attempting to sign up '${email}'...`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Algeria COD Director"
      }
    }
  });

  if (signUpError) {
    console.log("Sign up returned error (perhaps already registered):", signUpError.message);
  } else {
    console.log("Sign up succeeded! User ID:", signUpData.user?.id);
  }

  console.log(`Attempting to sign in with '${email}'...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.error("Sign in failed:", signInError.message);
  } else {
    console.log("Sign in succeeded! Authenticated User ID:", signInData.user?.id);
    
    // Check their profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user?.id)
      .single();

    if (profileError) {
      console.error("Error retrieving profile:", profileError.message);
    } else {
      console.log("Successfully retrieved profile. Assigned Role:", profile.role);
    }
  }
}

checkAuth();
