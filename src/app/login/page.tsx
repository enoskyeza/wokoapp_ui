'use client'
import React, {useState} from 'react';
import { useRouter } from 'next/navigation';
// import Link from "next/link";

const LoginPage: React.FC = () => {
    const router = useRouter();

    const [role, setRole] = useState<'staff' | 'judge'>('staff'); // Default role set to 'staff'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ username?: string; password?: string; login?:string }>({});

        // Mock credentials
    const mockUsername = 'staff';
    const mockPassword = 'tf-Staff-24';

    // Function to handle login
    const handleMockLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        // Clear any previous errors
        setErrors({});

        // Check if the username and password match the mock credentials
        if (username === mockUsername && password === mockPassword) {
            router.push('/dashboard'); // Redirect to the dashboard
        } else {
            // Set an error message for failed login
            setErrors({ login: 'Invalid username or password' });
        }
    };

    // const handleLogin = async (event: React.FormEvent) => {
    //     event.preventDefault();
    //     const newErrors: { username?: string; password?: string } = {};
    //
    //     if (!username.trim()) {
    //         newErrors.username = 'Username is required';
    //     }
    //
    //     if (!password.trim()) {
    //         newErrors.password = 'Password is required';
    //     }
    //
    //     setErrors(newErrors);
    //
    //     if (Object.keys(newErrors).length === 0) {
    //         // If no errors, proceed with login
    //         try {
    //             const response = await fetch('/api/login', {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({username, password, role}),
    //             });
    //
    //             if (response.ok) {
    //                 // Successful login - handle redirect based on userType (this is handled on the backend)
    //                 console.log('Login successful!');
    //             } else {
    //                 // Handle login error (e.g., display error message)
    //                 const data = await response.json();
    //                 console.error('Login failed:', data.message);
    //                 // You might want to set an error state to display the message to the user
    //             }
    //         } catch (error) {
    //             console.error('An error occurred during login:', error);
    //             // Handle unexpected errors
    //         }
    //     }
    // };

    // const handleLogin = (e: React.FormEvent) => {
    //   e.preventDefault();
    //
    //   // Submit login request (this will be handled by the backend)
    //   // You can also pass the 'role' to the backend to verify user type and get appropriate redirects
    //
    //   console.log(`Logging in as ${role}`);
    //   // After successful login, redirect based on role
    //   if (role === 'staff') {
    //     // Redirect to staff dashboard
    //     window.location.href = '/staff/dashboard';
    //   } else {
    //     // Redirect to judge dashboard
    //     window.location.href = '/judge/dashboard';
    //   }
    // };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Login</h2>

                {/* Form */}
                <form onSubmit={handleMockLogin}>
                    {/* Email Input */}
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                            Username
                        </label>
                        <input
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500 ${
                                errors.username ? 'border-red-500' : ''
                            }`}
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {errors.username && <p className="text-red-500 text-xs italic">{errors.username}</p>}
                    </div>

                    {/* Password Input */}
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                            Password
                        </label>
                        <input
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500 ${
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

                    {/* Role Selector */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Login as:</label>
                        <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="role"
                                    value="staff"
                                    checked={role === 'staff'}
                                    onChange={() => setRole('staff')}
                                    className="h-4 w-4 text-blue-600 focus:ring focus:ring-blue-500"
                                />
                                <span>Staff</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name="role"
                                    value="judge"
                                    checked={role === 'judge'}
                                    onChange={() => setRole('judge')}
                                    className="h-4 w-4 text-blue-600 focus:ring focus:ring-blue-500"
                                />
                                <span>Judge</span>
                            </label>
                        </div>
                    </div>

                     {/*Submit Button*/}
                    {errors.login && <p className="error text-red-500 text-sm text-center pb-2">{errors.login}</p>}

                    <button
                        type="submit"
                        className="w-full bg-blue-700 text-white py-3 rounded-lg shadow-md hover:bg-blue-800 transition-transform transform hover:scale-105 focus:scale-105"
                    >
                        Login
                    </button>
                    {/*<Link*/}
                    {/*    href={'/dashboard'}*/}
                    {/*    className="block w-full bg-blue-700 text-white text-center py-3 rounded-lg shadow-md hover:bg-blue-800 transition-transform transform hover:scale-105 focus:scale-105"*/}
                    {/*>*/}
                    {/*    Login*/}
                    {/*</Link>*/}
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
