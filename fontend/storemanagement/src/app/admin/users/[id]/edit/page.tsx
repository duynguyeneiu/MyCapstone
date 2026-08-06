'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { userService, ApiUser } from '@/src/services/userService'

interface SelectItem { value: string; text: string }

// TODO: no /api/Roles endpoint yet — hardcoded to match seeded RoleId values
const roleOptions: SelectItem[] = [
  { value: '1', text: 'Admin' },
  { value: '2', text: 'Staff' },
  { value: '3', text: 'Customer' },
]

export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const [original, setOriginal] = useState<ApiUser | null>(null)
  const [form, setForm] = useState({
    fullName: '', gender: '', phone: '', email: '', address: '', roleId: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    userService.getById(id)
      .then((u) => {
        setOriginal(u)
        setForm({
          fullName: u.fullName ?? '',
          gender: u.gender ?? '',
          phone: u.phone ?? '',
          email: u.email ?? '',
          address: u.address ?? '',
          roleId: String(u.roleId),
        })
      })
      .catch((err) => {
        console.error('Failed to load user:', err)
        setError('Failed to load user.')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!original) return
    setError(null)
    setSubmitting(true)
    try {
      const { role, ...rest } = original
      await userService.update(id, {
        ...rest,
        fullName: form.fullName,
        gender: form.gender || null,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        roleId: Number(form.roleId),
      })
      router.push('/admin/users')
    } catch (err) {
      console.error('Failed to update user:', err)
      setError('Failed to update user.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="EditProduct List">
        <p>Loading…</p>
      </section>
    )
  }

  return (
    <section className="EditProduct List">
      <h3>Edit user information</h3>
      <form className="row g-3" onSubmit={handleSubmit}>
        {error && (
          <div className="col-12">
            <div className="alert alert-danger">{error}</div>
          </div>
        )}
        <div className="col-12">
          <label className="form-label" htmlFor="inputName">Name</label>
          <input id="inputName" name="fullName" type="text" className="form-control"
            value={form.fullName} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputGender">Gender</label>
          <input id="inputGender" name="gender" className="form-control"
            value={form.gender} onChange={handleChange} />
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
          <label className="form-label" htmlFor="inputRole">Role</label>
          <select id="inputRole" name="roleId" className="form-select"
            value={form.roleId} onChange={handleChange}>
            <option value="">--Choose Role--</option>
            {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.text}</option>)}
          </select>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update'}
          </button>
        </div>
      </form>
    </section>
  )
}
