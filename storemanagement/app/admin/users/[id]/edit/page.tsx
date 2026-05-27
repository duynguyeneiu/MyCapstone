'use client'

import Image from 'next/image'
import { useState, FormEvent, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface SelectItem { value: string; text: string }
const mockRoles: SelectItem[] = [
  { value: '1', text: 'Admin' },
  { value: '2', text: 'Staff' },
  { value: '3', text: 'Customer' },
]

export default function EditUserPage() {
  const router  = useRouter()
  const params  = useParams()
  const id      = params.id as string
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    fullname: '', description: '', phone: '', email: '',
    address: '', roleId: '', avatar: '',
  })
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    // TODO: fetch(`/api/users/${id}`).then(r => r.json()).then(d => setForm({ ...d }))
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('userId', id)
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    if (fileRef.current?.files?.[0]) formData.append('ImageFile', fileRef.current.files[0])
    // TODO: await fetch(`/api/users/${id}`, { method: 'PUT', body: formData })
    router.push('/admin/users')
  }

  return (
    <section className="EditProduct List">
      <h3>Edit user information</h3>
      <form className="row g-3" onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="hidden" name="userId" value={id} />
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
            {mockRoles.map((r) => <option key={r.value} value={r.value}>{r.text}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputAvatar">Avatar</label>
          <input ref={fileRef} id="inputAvatar" name="ImageFile" type="file"
            className="form-control" accept="image/*" onChange={handleFile} />
          <div className="mt-2">
            {preview
              ? <img src={preview} alt="Preview" className="user-img" style={{ maxWidth: '50%', height: 'auto' }} />
              : form.avatar && (
                  <Image src={`/images/Users/${form.avatar}`} alt="Current"
                    width={200} height={200} className="user-img"
                    style={{ maxWidth: '50%', height: 'auto', objectFit: 'cover' }} />
                )
            }
          </div>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Update</button>
        </div>
      </form>
    </section>
  )
}
