'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', agreeTerms: false,
  })
  const [errors, setErrors] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: string[] = []
    if (form.password !== form.confirmPassword) errs.push('Passwords do not match.')
    if (!form.agreeTerms) errs.push('You must agree to the terms & conditions.')
    if (errs.length) { setErrors(errs); return }

    setErrors([])
    // TODO: gọi API đăng ký
    // const res = await fetch('/api/auth/register', { method: 'POST', body: JSON.stringify(form) })
    // if (res.ok) router.push('/login')
    console.log('Register:', form)
    router.push('/login')
  }

  return (
    <div className="register-page-wrapper">
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

      <div className="form-wrapper-register">
        <div className="form-box">
          <h2>Registration</h2>

          {errors.length > 0 && (
            <div className="text-danger mb-3">
              {errors.map((e) => <p key={e} className="mb-1">{e}</p>)}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <span className="icon"><i className="fa-solid fa-user"></i></span>
              <input
                type="text" id="inputName" name="fullName"
                value={form.fullName} onChange={handleChange} required
              />
              <label htmlFor="inputName">Full name</label>
            </div>
            <div className="input-box">
              <span className="icon"><i className="fa-solid fa-envelope"></i></span>
              <input
                type="email" id="inputEmail" name="email"
                value={form.email} onChange={handleChange} required
              />
              <label htmlFor="inputEmail">Email</label>
            </div>
            <div className="input-box">
              <span className="icon"><i className="fa-solid fa-lock"></i></span>
              <input
                type="password" id="inputPassword" name="password"
                value={form.password} onChange={handleChange} required
              />
              <label htmlFor="inputPassword">Password</label>
            </div>
            <div className="input-box">
              <span className="icon"><i className="fa-solid fa-lock"></i></span>
              <input
                type="password" id="inputConfirmPassword" name="confirmPassword"
                value={form.confirmPassword} onChange={handleChange} required
              />
              <label htmlFor="inputConfirmPassword">Confirm password</label>
            </div>

            <div className="remember-forgot">
              <label htmlFor="readCheck">
                <input
                  type="checkbox" id="readCheck" name="agreeTerms"
                  checked={form.agreeTerms} onChange={handleChange}
                  style={{ marginRight: 6 }}
                />
                I agree to the terms &amp; conditions
              </label>
            </div>

            <button type="submit" className="btn-1">Register</button>

            <div className="login-register">
              <p>
                Already have an account?{' '}
                <Link href="/login" className="login-link">Login</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
