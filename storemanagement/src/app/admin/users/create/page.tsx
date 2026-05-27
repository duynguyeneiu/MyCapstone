'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface SelectItem { value: string; text: string }

// TODO: fetch từ API
const mockRoles: SelectItem[] = [
  { value: '1', text: 'Admin' },
  { value: '2', text: 'Staff' },
  { value: '3', text: 'Customer' },
]

export default function CreateUserPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullname: '', description: '', password: '',
    phone: '', email: '', address: '', roleId: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    if (imageFile) formData.append('ImageFile', imageFile)
    // TODO: await fetch('/api/users', { method: 'POST', body: formData })
    console.log('Create user:', form)
    router.push('/admin/users')
  }

  return (
    <section className="Create">
      <h3>Create new user</h3>
      <form className="row g-3" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="col-12">
          <label className="form-label" htmlFor="inputName">Name</label>
          <input id="inputName" name="fullname" type="text" className="form-control"
            value={form.fullname} onChange={handleChange} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="inputDesc">Description</label>
          <textarea id="inputDesc" name="description" className="form-control"
            value={form.description} onChange={handleChange} rows={2} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="inputPassword">Password</label>
          <input id="inputPassword" name="password" type="password" className="form-control"
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
          <label className="form-label" htmlFor="inputAvatar">Avatar</label>
          <input id="inputAvatar" name="ImageFile" type="file" className="form-control"
            accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputRole">Role</label>
          <select id="inputRole" name="roleId" className="form-select"
            value={form.roleId} onChange={handleChange}>
            <option value="">--Choose Role--</option>
            {mockRoles.map((r) => <option key={r.value} value={r.value}>{r.text}</option>)}
          </select>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Create</button>
        </div>
      </form>
    </section>
  )
}
