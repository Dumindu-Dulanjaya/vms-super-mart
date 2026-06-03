// src/pages/Login.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import vmsHero from '../assets/vms hero.png'

export default function Login() {
  const navigate = useNavigate()
  const { userLogin, registerUser, googleLogin } = useAppContext()
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

  const handleGoogleCredentialResponse = async (response) => {
    setError('')
    setSuccess('')
    try {
      await googleLogin(response.credential)
      setSuccess('Google login successful!')
      setDone(true)
      setTimeout(() => navigate('/'), 1400)
    } catch (e) {
      setError(e.message || 'Google login failed')
    }
  }


  React.useEffect(() => {
    const initGoogle = () => {
      if (window.google && document.getElementById('googleBtn')) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com',
          callback: handleGoogleCredentialResponse,
        })
        window.google.accounts.id.renderButton(
          document.getElementById('googleBtn'),
          { theme: 'outline', size: 'large', width: '320' }
        )
      }
    }

    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initGoogle
      document.body.appendChild(script)
    } else {
      initGoogle()
    }
  }, [mode])

  const submit = async (e) => {
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

    try {
      if (mode === 'login') {
        await userLogin(data.email, data.password)
        setSuccess('Login successful!')
      } else {
        let firstName = data.name.trim()
        let lastName = 'User'
        const nameParts = data.name.trim().split(/\s+/)
        if (nameParts.length > 1) {
          firstName = nameParts[0]
          lastName = nameParts.slice(1).join(' ')
        }

        await registerUser({
          firstName,
          lastName,
          email: data.email,
          password: data.password,
        })
        setSuccess('Registration successful!')
      }
      setDone(true)
      setTimeout(() => navigate('/'), 1400)
    } catch (err) {
      setError(err.message || 'Authentication failed')
    }
  }

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
        </div>
      </div>
    )
  }

  // inline style applied to inputs to remove browser autofill highlight
  const autofillReset = {
    WebkitBoxShadow: '0 0 0 30px #ffffff inset',
    WebkitTextFillColor: '#0f172a'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-6 lg:p-12">
      <div className="w-full max-w-5xl bg-white rounded-none shadow-md overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side: Form Container */}
        <div className="w-full md:w-[45%] p-8 lg:p-12 flex flex-col justify-center">
          <form onSubmit={submit} className="w-full max-w-md mx-auto text-center">
            <h1 className="text-3xl font-medium text-gray-900">{mode === 'login' ? 'Login' : 'Register'}</h1>
            <p className="text-sm text-gray-500 mt-2">Please {mode === 'login' ? 'sign in' : 'sign up'} to continue</p>

            {error && <div className="mt-4 text-red-700 text-sm bg-red-50 border border-red-100 p-2 rounded">{error}</div>}
            {success && <div className="mt-4 text-green-700 text-sm bg-green-50 border border-green-100 p-2 rounded">{success}</div>}

            <div className="mt-6 space-y-4">
              {mode !== 'login' && (
                <div className="flex items-center bg-white border border-gray-200 rounded-full h-12 px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 mr-3" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>

                  <input
                    type="text"
                    placeholder="Name"
                    autoComplete="name"
                    style={autofillReset}
                    className="bg-transparent text-zinc-600 placeholder-zinc-500 outline-none text-sm w-full"
                    name="name"
                    value={data.name}
                    onChange={onChange}
                    required={mode !== 'login'}
                  />
                </div>
              )}

              <div className="flex items-center bg-white border border-gray-200 rounded-full h-12 px-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 mr-3" viewBox="0 0 24 24" >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>

                <input
                  type="email"
                  placeholder="Email id"
                  autoComplete="email"
                  style={autofillReset}
                  className="bg-transparent text-zinc-600 placeholder-zinc-500 outline-none text-sm w-full"
                  name="email"
                  value={data.email}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="flex items-center bg-white border border-gray-200 rounded-full h-12 px-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 mr-3" viewBox="0 0 24 24" >
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>

                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  style={autofillReset}
                  className="bg-transparent text-zinc-600 placeholder-zinc-500 outline-none text-sm w-full"
                  name="password"
                  value={data.password}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            <div className="text-left mt-3">
              <a className="text-sm text-[#00CC29] hover:text-[#00FF33] font-bold" href="#">Forgot password?</a>
            </div>

            {/* Updated Login Button with VMS logo green for both modes */}
            <button
              type="submit"
              className="mt-6 w-full h-11 rounded-full text-white transition bg-[#00FF33] hover:bg-[#00CC29] font-black uppercase text-xs tracking-widest cursor-pointer border-none"
            >
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-3 text-[10px] text-gray-400 font-black uppercase tracking-wider">Or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Google Login Button Container */}
            <div className="w-full flex justify-center">
              <div id="googleBtn" className="w-full max-w-xs h-[40px] overflow-hidden"></div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                className="text-[#00CC29] hover:text-[#00FF33] font-bold ml-1 cursor-pointer bg-transparent border-none outline-none"
                onClick={() => {
                  setMode((prev) => (prev === 'login' ? 'register' : 'login'))
                  setError('')
                  setSuccess('')
                }}
              >
                {mode === 'login' ? 'Register' : 'Login'}
              </button>
            </p>

            {/* New Admin Login Link */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-2">
                <span className="text-[10px] text-gray-400 font-black tracking-widest uppercase">Management Portal</span>
                <button 
                    type="button"
                    onClick={() => navigate('/admin/login')}
                    className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Authorized Admin Login
                </button>
            </div>
          </form>
        </div>

        {/* Right Side: Image Banner */}
        <div className="hidden md:block w-[55%] bg-slate-900 relative">
          <img 
            src={vmsHero} 
            alt="VMS Super Mart Storefront" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/10"></div>
        </div>
      </div>
    </div>
  )
}