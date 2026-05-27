'use client'

import Image from 'next/image'
import { useState, FormEvent, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditCategoryPage() {
  const router  = useRouter()
  const params  = useParams()
  const id      = params.id as string
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName]         = useState('')
  const [avatar, setAvatar]     = useState('')
  const [preview, setPreview]   = useState<string | null>(null)

  useEffect(() => {
    // TODO: fetch(`/api/categories/${id}`).then(r => r.json()).then(d => { setName(d.name); setAvatar(d.avatar) })
  }, [id])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('categoryId', id)
    formData.append('name', name)
    if (fileRef.current?.files?.[0]) formData.append('ImageFile', fileRef.current.files[0])
    // TODO: await fetch(`/api/categories/${id}`, { method: 'PUT', body: formData })
    router.push('/admin/categories')
  }

  return (
    <section className="EditProduct List">
      <h3>Edit category</h3>
      <form className="row g-3" onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="hidden" name="categoryId" value={id} />
        <div className="col-12">
          <label className="form-label" htmlFor="inputName">Name</label>
          <input id="inputName" type="text" className="form-control"
            value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputAvatar">Image</label>
          <input ref={fileRef} id="inputAvatar" name="ImageFile" type="file"
            className="form-control" accept="image/*" onChange={handleFile} />
          <div className="mt-2">
            {preview
              ? <img src={preview} alt="Preview" style={{ maxWidth: '50%', height: 'auto' }} />
              : avatar && (
                  <Image src={`/images/Products/${avatar}`} alt="Current"
                    width={200} height={200} style={{ maxWidth: '50%', height: 'auto', objectFit: 'cover' }} />
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
