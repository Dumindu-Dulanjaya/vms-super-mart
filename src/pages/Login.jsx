// src/pages/Login.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = React.useState('login') // 'login' or 'register'
  const [data, setData] = React.useState({ name: '', email: '', password: '' })
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')
  const [done, setDone] = React.useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    setData((p) => ({ ...p, [name]: value }))
  }

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  const submit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (mode !== 'login' && !data.name.trim()) {
      return setError('Name is required')
    }
    if (!data.email.trim() || !data.password) {
      return setError('Please fill email and password')
    }
    if (!isEmail(data.email)) {
      return setError('Please enter a valid email')
    }
    if (data.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    // Simulate success (replace with real auth call)
    setSuccess(mode === 'login' ? 'Login successful!' : 'Registration successful!')
    setDone(true)
    setTimeout(() => navigate('/'), 1400)
  }

  // When done show a friendly redirect screen
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm bg-white rounded-2xl p-8 text-center shadow-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-gray-900">You're in!</h2>
          <p className="mt-2 text-sm text-gray-500">{success} Redirecting to home…</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-[#00FF33] hover:bg-[#00CC29] text-white rounded-full">Go now</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-2xl p-8 text-center shadow">
        <h1 className="text-3xl font-medium text-gray-900">{mode === 'login' ? 'Login' : 'Register'}</h1>
        <p className="text-sm text-gray-500 mt-2">Please {mode === 'login' ? 'sign in' : 'sign up'} to continue</p>

        {error && <div className="mt-4 text-red-700 text-sm bg-red-50 border border-red-100 p-2 rounded">{error}</div>}
        {success && <div className="mt-4 text-green-700 text-sm bg-green-50 border border-green-100 p-2 rounded">{success}</div>}

        <div className="mt-6 space-y-4">
          {mode !== 'login' && (
            <div className="flex items-center bg-white border border-gray-200 rounded-full h-12 px-4">
              {/* User Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 mr-3" viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>

              <input
                type="text"
                placeholder="Name"
                className="bg-transparent text-zinc-600 placeholder-zinc-500 outline-none text-sm w-full"
                name="name"
                value={data.name}
                onChange={onChange}
                required={mode !== 'login'}
              />
            </div>
          )}

          <div className="flex items-center bg-white border border-gray-200 rounded-full h-12 px-4">
            {/* Mail Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 mr-3" viewBox="0 0 24 24" >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>

            <input
              type="email"
              placeholder="Email id"
              className="bg-transparent text-zinc-600 placeholder-zinc-500 outline-none text-sm w-full"
              name="email"
              value={data.email}
              onChange={onChange}
              required
            />
          </div>

          <div className="flex items-center bg-white border border-gray-200 rounded-full h-12 px-4">
            {/* Lock Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 mr-3" viewBox="0 0 24 24" >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>

            <input
              type="password"
              placeholder="Password"
              className="bg-transparent text-zinc-600 placeholder-zinc-500 outline-none text-sm w-full"
              name="password"
              value={data.password}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="text-left mt-3">
          <a className="text-sm text-[#7c3aed]" href="#">Forgot password?</a>
        </div>

        <button type="submit" className="mt-6 w-full h-11 rounded-full text-white bg-[#7c3aed] hover:bg-[#6b21a8] transition">
          {mode === 'login' ? 'Login' : 'Create Account'}
        </button>

        <p className="text-sm text-gray-500 mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            className="text-[#7c3aed] ml-1"
            onClick={() => {
              setMode((prev) => (prev === 'login' ? 'register' : 'login'))
              setError('')
              setSuccess('')
            }}
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </form>
    </div>
  )
}
