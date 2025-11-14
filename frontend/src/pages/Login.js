import React, { useState } from 'react';
import api from '../utils/api';
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { handleApiError, handleUnexpectedError } from '../utils/errorHandler';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true for login, false for register
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setErrorType('');

    try {
      // Validate inputs
      if (!username.trim() || !password.trim()) {
        throw new Error('Username and password are required');
      }

      if (username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const requestData = isLogin
        ? { username, password }
        : { username, password }; // No email needed for registration

      const response = await api.post(endpoint, requestData);

      if (response.data.accessToken && response.data.refreshToken) {
        // Store both access and refresh tokens
        localStorage.setItem('access_token', response.data.accessToken);
        localStorage.setItem('refresh_token', response.data.refreshToken);

        setIsAuthenticated(true);
      } else {
        throw new Error('Login response did not contain required tokens');
      }
    } catch (err) {
      const errorInfo = handleApiError(err, isLogin ? 'Login failed' : 'Registration failed');
      setError(errorInfo.message);
      setErrorType(errorInfo.type);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFF5E1]">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md border border-[#708090]/30 transform transition-all duration-500 hover:shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6F61] to-[#A8E6CF] flex items-center justify-center mb-4">
            {isLogin ? (
              <FiLogIn className="text-white text-2xl" />
            ) : (
              <FiUserPlus className="text-white text-2xl" />
            )}
          </div>
          <h2 className="text-2xl font-light text-[#001F3F]">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[#001F3F]/70 mt-2">
            {isLogin ? 'Sign in to access your portfolio' : 'Join our community of photographers'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-center border border-red-200 flex items-center justify-center animate-pulse">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            {error}
            {errorType === 'network' && (
              <p className="text-xs mt-1 text-red-600">Please check your internet connection</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="relative">
            <label className="block text-[#001F3F] text-sm font-medium mb-2" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-[#708090]" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-cream-50 border border-[#708090]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-[#001F3F] transition-all duration-300"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-[#001F3F] text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-[#708090]" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-cream-50 border border-[#708090]/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A8E6CF] focus:border-transparent text-[#001F3F] transition-all duration-300"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FiEyeOff className="text-[#708090] hover:text-[#001F3F]" />
                ) : (
                  <FiEye className="text-[#708090] hover:text-[#001F3F]" />
                )}
              </button>
            </div>
          </div>

          <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-xl font-medium text-white transition-all duration-300 ${
                isLoading
                  ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#FF6F61] via-[#FF9933] to-[#A8E6CF] hover:from-[#e56259] hover:via-[#ff8a14] hover:to-[#7fc9ae] transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
              }`}
            >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : isLogin ? (
              <>
                <FiLogIn className="mr-2" /> Sign In
              </>
            ) : (
              <>
                <FiUserPlus className="mr-2" /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setErrorType('');
            }}
            className="text-[#A8E6CF] hover:text-[#7fc9ae] font-medium transition-colors duration-300 flex items-center justify-center"
          >
            {isLogin ? (
              <>
                <FiUserPlus className="mr-2" /> Create an account
              </>
            ) : (
              <>
                <FiLogIn className="mr-2" /> Already have an account? Sign in
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-[#708090]/20 text-center">
          <p className="text-[#001F3F]/60 text-sm">
            By signing in, you agree to our <a href="#" className="text-[#A8E6CF] hover:underline">Terms</a> and <a href="#" className="text-[#A8E6CF] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;