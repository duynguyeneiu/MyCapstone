'use client'

import Image from 'next/image'
import { useState, FormEvent, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditBrandPage() {
  const router  = useRouter()
  const params  = useParams()
  const id      = params.id as string
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ name: '', description: '', logo: '' })
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    // TODO: fetch(`/api/brands/${id}`).then(r => r.json()).then(d => setForm({ name: d.name, description: d.description, logo: d.logo }))
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('brandId', id)
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    if (fileRef.current?.files?.[0]) formData.append('ImageFile', fileRef.current.files[0])
    // TODO: await fetch(`/api/brands/${id}`, { method: 'PUT', body: formData })
    router.push('/admin/brands')
  }

  return (
    <section className="EditProduct List">
      <h3>Edit brand</h3>
      <form className="row g-3" onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="hidden" name="brandId" value={id} />
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
          <input ref={fileRef} id="inputLogo" name="ImageFile" type="file"
            className="form-control" accept="image/*" onChange={handleFile} />
          <div className="mt-2">
            {preview
              ? <img src={preview} alt="Preview" className="brand-img" style={{ maxWidth: '50%', height: 'auto' }} />
              : form.logo && (
                  <Image src={`/images/Brands/${form.logo}`} alt="Current logo"
                    width={400} height={200} className="brand-img" style={{ maxWidth: '50%', height: 'auto', objectFit: 'contain' }} />
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
