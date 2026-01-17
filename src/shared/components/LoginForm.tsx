import React, {useState} from 'react';
import {Button} from '@shared/components/Button.tsx';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log({email, password});
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap- max-w-sm">
  <input
    type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="px-4 py-3 rounded-md border"
  />

  <input
    type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="px-4 py-3 rounded-md border"
  />

  <Button type="submit" fullWidth>
  Log In
  </Button>
  </form>
);
}