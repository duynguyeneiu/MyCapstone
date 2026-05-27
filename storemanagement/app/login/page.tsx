'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    // TODO: gọi API login / next-auth signIn
    // const res = await signIn('credentials', { email, password, redirect: false })
    // if (res?.error) setError('Email hoặc mật khẩu không đúng')
    // else router.push('/')
    console.log('Login:', email, password)
    router.push('/')
  }

  return (
    <div className="login-page-wrapper">
      {/* Mini nav */}
      <header className="login">
        <nav className="navigation">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <a href="#footer-contact">Contact</a>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </nav>
      </header>

      <div className="form-wrapper-login">
        <div className="form-box">
          <h2>Login</h2>
          {error && <p className="text-danger text-center mb-3">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <span className="icon"><i className="fa-solid fa-envelope"></i></span>
              <input
                type="email"
                id="inputEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="inputEmail">Email</label>
            </div>
            <div className="input-box">
              <span className="icon"><i className="fa-solid fa-lock"></i></span>
              <input
                type="password"
                id="inputPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="inputPassword">Password</label>
            </div>
            <div className="remember-forgot">
              <label>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ marginRight: 6 }}
                />
                Remember me
              </label>
              <a href="#">Forgot Password?</a>
            </div>
            <button type="submit" className="btn-1">Login</button>
            <div className="login-register">
              <p>
                Don&apos;t have an account?{' '}
                <Link href="/register" className="register-link">Register</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
