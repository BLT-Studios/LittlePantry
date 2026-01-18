import React, { useState } from 'react';
import logo from '@assets/logo.png';
import eye from '@assets/eye-closed.png';
import eyeOpen from '@assets/eye-icon.png';
import { Button } from './Button';
import { Link } from 'react-router-dom';

type CardFormMode = 'login' | 'signup';

interface CardFormProps {
  mode?: CardFormMode;
}

export default function CardForm({ mode = 'login' }: CardFormProps) {
  const isSignup = mode === 'signup';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log({
      mode,
      name,
      email,
      zip,
      password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teal-150 px-4 text-sm text-black/60">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-lg bg-white rounded-xl p-10"
      >
        {/* Language Selector */}
        <div className="w-full flex justify-end mb-4">
          <select className="bg-white border border-gray-300 rounded px-3 py-2 text-sm">
            <option>English (USA)</option>
            <option>Français (CAN)</option>
            <option>Español (USA)</option>
          </select>
        </div>

        {/* Header */}
        <header className="text-center text-5xl animate-bounce mb-2">
          Little Pantry
        </header>

        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img src={logo} alt="logo" className="h-28" />
        </div>

        {/* Name (signup only) */}
        {isSignup && (
          <div className="w-full mb-4">
            <label className="block text-black/90 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 rounded-md bg-neutral-100 px-4"
              required
            />
          </div>
        )}

        {/* Email */}
        <div className="w-full mb-4">
          <label className="block text-black/90 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 rounded-md bg-neutral-100 px-4"
            required
          />
        </div>

        {/* ZIP (signup only) */}
        {isSignup && (
          <div className="w-full mb-4">
            <label className="block text-black/90 mb-1">ZIP Code</label>
            <input
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full h-12 rounded-md bg-neutral-100 px-4"
              required
            />
          </div>
        )}

        {/* Password */}
        <div className="w-full mb-4 relative">
          <label className="block text-black/90 mb-1">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 rounded-md bg-neutral-100 px-4 pr-12"
            required
          />
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onMouseEnter={() => setShowPassword(true)}
            onMouseLeave={() => setShowPassword(false)}
          >
            <img
              src={showPassword ? eyeOpen : eye}
              className="h-5 w-5 opacity-60 cursor-pointer"
              alt="Toggle password visibility"
            />
          </div>
        </div>

        {/* Forgot password (login only) */}
        {!isSignup && (
          <Link
            to="/forgot-password"
            className="text-teal-950 text-sm mb-6 hover:underline self-start"
          >
            Forgot your password?
          </Link>
        )}

        {/* Submit */}
        <Button type="submit" variant="primary">
          {isSignup ? 'Create Account' : 'Sign In'}
        </Button>

        {/* Footer Link */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {isSignup ? (
            <>
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 hover:underline">
                Sign In
              </Link>
            </>
          ) : (
            <>
              Don’t have an account?{' '}
              <Link to="/signup" className="text-teal-600 hover:underline">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </form>
    </div>
  );
}