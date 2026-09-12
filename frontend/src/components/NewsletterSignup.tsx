import React, { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      setMessage('Please enter an email address.');
      return;
    }
    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    
    // Simulate API call to subscribe
    setTimeout(() => {
      setStatus('success');
      setMessage('Thanks for subscribing!');
      setEmail('');
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 relative">
      <input 
        type="email" 
        placeholder="Email Address" 
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === 'error') setStatus('idle');
        }}
        disabled={status === 'loading' || status === 'success'}
        className={`bg-white text-gray-900 px-4 py-2.5 rounded text-sm focus:outline-none focus:ring-2 ${
          status === 'error' ? 'border-2 border-red-500 focus:ring-red-500' : 'border-none focus:ring-[#f0364c]'
        }`}
      />
      
      {status === 'error' && (
        <p className="text-red-500 text-xs mt-[-4px]">{message}</p>
      )}
      {status === 'success' && (
        <p className="text-[#2ee661] font-medium text-xs mt-[-4px]">{message}</p>
      )}

      <button 
        type="submit" 
        disabled={status === 'loading' || status === 'success'}
        className="bg-[#f0364c] text-white font-semibold text-sm px-4 py-2.5 rounded hover:bg-red-600 transition-colors self-start disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
      >
        {status === 'loading' ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          'Submit'
        )}
      </button>
    </form>
  );
}
