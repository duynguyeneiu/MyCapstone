'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateCategoryPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', name)
    if (imageFile) formData.append('ImageFile', imageFile)
    // TODO: await fetch('/api/categories', { method: 'POST', body: formData })
    console.log('Create category:', name)
    router.push('/admin/categories')
  }

  return (
    <section className="Create">
      <h3>Create new category</h3>
      <form className="row g-3" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="col-12">
          <label className="form-label" htmlFor="inputName">Name</label>
          <input id="inputName" type="text" className="form-control"
            value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputAvatar">Image</label>
          <input id="inputAvatar" name="ImageFile" type="file" className="form-control"
            accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Create</button>
        </div>
      </form>
    </section>
  )
}
