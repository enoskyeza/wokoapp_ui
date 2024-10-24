'use client'
import React, { useState } from 'react';
import Link from 'next/link';

const LoginPage: React.FC = () => {
  const [userType, setUserType] = useState<'staff' | 'judge'>('staff');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const handleUserTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserType(event.target.value as 'staff' | 'judge');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // If no errors, proceed with login
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password, userType }),
        });

        if (response.ok) {
          // Successful login - handle redirect based on userType (this is handled on the backend)
          console.log('Login successful!');
        } else {
          // Handle login error (e.g., display error message)
          const data = await response.json();
          console.error('Login failed:', data.message);
          // You might want to set an error state to display the message to the user
        }
      } catch (error) {
        console.error('An error occurred during login:', error);
        // Handle unexpected errors
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="max-w-md w-full px-6 py-10 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">Login</h2>

        {/* User Type Selection */}
        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-700"
              value="staff"
              checked={userType === 'staff'}
              onChange={handleUserTypeChange}
            />
            <span className="ml-2">Staff</span>
          </label>
          <label className="inline-flex items-center ml-6">
            <input
              type="radio"
              className="form-radio text-blue-700"
              value="judge"
              checked={userType === 'judge'}
              onChange={handleUserTypeChange}
            />
            <span className="ml-2">Judge</span>
          </label>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.username ? 'border-red-500' : ''
              }`}
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {errors.username && <p className="text-red-500 text-xs italic">{errors.username}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                errors.password ? 'border-red-500' : ''
              }`}
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
          </div>
          <div className="flex flex-col items-center"> {/* Changed to flex-col for better spacing */}
            <button
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Login
            </button>
            <Link href="/forgot-password">
              {/* Assuming you'll create a /forgot-password page */}
              <p className="text-sm text-blue-700 hover:text-blue-800 mt-2">
                Forgot Password?
              </p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;