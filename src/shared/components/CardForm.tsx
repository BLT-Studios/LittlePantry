import React, { useState } from 'react';
import logo from '@assets/logo.png';
import eye from '@assets/eye-closed.png';
import eyeOpen from '@assets/eye-icon.png';
import { Button } from './Button';

export default function CardForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-150 px-4 text-sm text-black/60">
      <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center w-full max-w-lg bg-white rounded-xl p-10">
        <div className="w-full flex justify-end mb-4">
          <select
            className="bg-white border border-gray-300 rounded px-3 py-2 text-sm"
            aria-label="Language selector"
          >
            <option>English (USA)</option>
            <option>Français (CAN)</option>
            <option>Español (USA)</option>
          </select>
        </div>
        <header className="text-center text-5xl animate-bounce color-text">Little Pantry</header>
        <div className="mb-6 w-full flex justify-center">
          <img
            src={logo}
            alt="logo"
            className="h-10"
          />

        </div>
        <div className="w-full mb-4">
          <label htmlFor="username" className="block text-black/90 mb-1">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-12 rounded-md bg-neutral-100 px-4 text-black/90"
            required
          />
        </div>

        <div className="w-full mb-2 relative ">
          <label htmlFor="password" className="block text-black/90 mb-1">Password</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 rounded-md bg-neutral-100 px-4 text-black/90 pr-12"
            required
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onMouseEnter={() => setShowPassword(true)}
            onMouseLeave={() => setShowPassword(false)}
          >
            <img
              src={showPassword ? eyeOpen : eye}
              alt="Toggle Password Visibility"
              className="h-5 w-5 opacity-60 cursor-pointer"
            />
          </div>
        </div>

        <a href="#" className="text-teal-950 text-sm mb-6 hover:underline">Forgot your password?</a>

        <Button
          type="submit"
          variant="primary"
        >
          Sign In
        </Button>
      </form>
    </div>
  );
}
