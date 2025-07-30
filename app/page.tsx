"use client"

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import toast, { Toaster } from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn, FiLoader } from 'react-icons/fi';
import { auth } from '../FirebaseConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill all fields');
      return;
    }

try {
  setLoading(true);
  await signInWithEmailAndPassword(auth, email, password);
  toast.success('Login successful!');
  // No need to redirect here, the useEffect will handle it
} catch (err: unknown) {
  console.error('Login error:', err);

  if (err instanceof Error && typeof (err as any).code === 'string') {
    const code = (err as any).code;

    switch (code) {
      case 'auth/invalid-email':
        toast.error('Invalid email format');
        break;
      case 'auth/user-not-found':
        toast.error('No user found with this email');
        break;
      case 'auth/wrong-password':
        toast.error('Incorrect password');
        break;
      case 'auth/too-many-requests':
        toast.error('Account temporarily locked due to many failed attempts');
        break;
      default:
        toast.error('Login failed. Please try again.');
    }
  } else {
    toast.error('An unexpected error occurred.');
  }
} finally {
  setLoading(false);
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1F2937',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }
        }} 
      />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white mb-2">Welcome Back</h2>
          <p className="text-lg text-indigo-100">Sign in to your admin dashboard</p>
        </div>

        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="px-10 py-12">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-indigo-100">
                  Email address
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-indigo-300" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-white sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-indigo-100">
                  Password
                </label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-indigo-300" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white focus:border-white sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <FiLoader className="animate-spin mr-2 h-4 w-4" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <FiLogIn className="mr-2 h-4 w-4" />
                      Log in
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
}