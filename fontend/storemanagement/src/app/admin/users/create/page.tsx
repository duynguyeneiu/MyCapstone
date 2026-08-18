'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { userService } from '@/src/services/userService'

interface SelectItem { value: string; text: string }

// TODO: no /api/Roles endpoint yet — hardcoded to match seeded RoleId values
const roleOptions: SelectItem[] = [
  { value: '1', text: 'Admin' },
  { value: '2', text: 'Staff' },
  { value: '3', text: 'Customer' },
]

export default function CreateUserPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '', username: '', password: '', gender: '',
    phone: '', email: '', address: '', roleId: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await userService.create({
        fullName: form.fullName,
        username: form.username,
        password: form.password,
        gender: form.gender || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        roleId: Number(form.roleId),
        status: 'Active',
      })
      router.push('/admin')
    } catch (err) {
      console.error('Failed to create user:', err)
      setError('Failed to create user. Please check the fields and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="Create">
      <h3>Create new user</h3>
      <form className="row g-3" onSubmit={handleSubmit}>
        {error && (
          <div className="col-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}
        <div className="col-12">
          <label className="form-label" htmlFor="inputName">Name</label>
          <input id="inputName" name="fullName" type="text" className="form-control" required
            value={form.fullName} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputUsername">Username</label>
          <input id="inputUsername" name="username" type="text" className="form-control" required
            value={form.username} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputPassword">Password</label>
          <input id="inputPassword" name="password" type="password" className="form-control" required
            value={form.password} onChange={handleChange} placeholder="Password" />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputPhone">Phone</label>
          <input id="inputPhone" name="phone" type="tel" className="form-control"
            value={form.phone} onChange={handleChange} pattern="[0-9]{10}" />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputEmail">Email</label>
          <input id="inputEmail" name="email" type="email" className="form-control"
            value={form.email} onChange={handleChange} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="inputAddress">Address</label>
          <input id="inputAddress" name="address" className="form-control"
            value={form.address} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputGender">Gender</label>
          <input id="inputGender" name="gender" className="form-control"
            value={form.gender} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputRole">Role</label>
          <select id="inputRole" name="roleId" className="form-select" required
            value={form.roleId} onChange={handleChange}>
            <option value="">--Choose Role--</option>
            {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.text}</option>)}
          </select>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </section>
  )
}
