'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateBrandPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', description: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    if (imageFile) formData.append('ImageFile', imageFile)
    // TODO: await fetch('/api/brands', { method: 'POST', body: formData })
    router.push('/admin/brands')
  }

  return (
    <section className="Create">
      <h3>Create new brand</h3>
      <form className="row g-3" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="col-12">
          <label className="form-label" htmlFor="inputName">Name</label>
          <input id="inputName" name="name" type="text" className="form-control"
            value={form.name} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="inputDesc">Description</label>
          <textarea id="inputDesc" name="description" className="form-control"
            value={form.description} onChange={handleChange} rows={3} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputLogo">Logo</label>
          <input id="inputLogo" name="ImageFile" type="file" className="form-control"
            accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Create</button>
        </div>
      </form>
    </section>
  )
}
