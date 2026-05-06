'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function SignupPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (!error) alert('Check your email to confirm');
    else alert(error.message);
  };

  return (
    <div className="shell">
      <h1>Sign Up</h1>

      <input onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />

      <button onClick={handleSignup}>Create Account</button>
    </div>
  );
}
