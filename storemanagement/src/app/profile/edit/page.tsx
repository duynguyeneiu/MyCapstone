'use client'

import Image from 'next/image'
import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UserForm {
  userId: number
  fullname: string
  description: string
  phone: string
  email: string
  address: string
  avatar: string
}

// TODO: lấy thông tin user hiện tại từ session / API
const mockUser: UserForm = {
  userId: 1,
  fullname: 'Nguyễn Văn A',
  description: '',
  phone: '',
  email: 'user@example.com',
  address: '',
  avatar: 'default.jpg',
}

export default function EditProfilePage() {
  const router  = useRouter()
  const [form, setForm]     = useState<UserForm>(mockUser)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // TODO: upload image + gọi API update profile
    // const formData = new FormData()
    // Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)))
    // if (fileRef.current?.files?.[0]) formData.append('ImageFile', fileRef.current.files[0])
    // await fetch(`/api/users/${form.userId}`, { method: 'PUT', body: formData })
    console.log('Update profile:', form)
    router.push('/profile')
  }

  return (
    <section className="EditUser admin-content-wrap">
      <div className="container">
        <h3 className="mb-4">Edit user information</h3>
        <form className="row g-3" onSubmit={handleSubmit} encType="multipart/form-data">
          <input type="hidden" name="userId" value={form.userId} />

          <div className="col-12">
            <label className="form-label fw-bold" htmlFor="inputName">Name</label>
            <input id="inputName" name="fullname" type="text" className="form-control"
              value={form.fullname} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label fw-bold" htmlFor="inputDescription">Description</label>
            <textarea id="inputDescription" name="description" className="form-control"
              value={form.description} onChange={handleChange} rows={3} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold" htmlFor="inputPhone">Phone</label>
            <input id="inputPhone" name="phone" type="tel" className="form-control"
              value={form.phone} onChange={handleChange} pattern="[0-9]{10}" />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold" htmlFor="inputEmail">Email</label>
            <input id="inputEmail" name="email" type="email" className="form-control"
              value={form.email} onChange={handleChange} />
          </div>
          <div className="col-12">
            <label className="form-label fw-bold" htmlFor="inputAddress">Address</label>
            <input id="inputAddress" name="address" className="form-control"
              value={form.address} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold" htmlFor="inputAvatar">Avatar</label>
            <input ref={fileRef} id="inputAvatar" name="ImageFile" type="file"
              className="form-control" accept="image/*" onChange={handleFile} />
            <div className="mt-2">
              {preview
                ? <img src={preview} alt="Preview" style={{ maxWidth: '50%', height: 'auto', marginTop: 8 }} />
                : <Image src={`/images/Users/${form.avatar}`} alt="Avatar"
                    width={200} height={200} style={{ maxWidth: '50%', height: 'auto', marginTop: 8, objectFit: 'cover' }} />
              }
            </div>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary">Update</button>
          </div>
        </form>
      </div>
    </section>
  )
}
