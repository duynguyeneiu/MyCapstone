'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { categoryService, ApiCategoryRaw } from '@/src/services/categoryService'

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const id     = Number(params.id)

  const [raw, setRaw]           = useState<ApiCategoryRaw | null>(null)
  const [name, setName]         = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    categoryService.getRawById(id)
      .then((d) => {
        setRaw(d)
        setName(d.categoryName)
        setDescription(d.description ?? '')
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!raw) return
    setSaving(true)
    try {
      await categoryService.update(id, { ...raw, categoryName: name, description })
      router.push('/admin/categories')
    } catch (err) {
      console.error(err)
      alert('Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <section className="EditProduct List"><p>Loading…</p></section>

  return (
    <section className="EditProduct List">
      <h3>Edit category</h3>
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-12">
          <label className="form-label" htmlFor="inputName">Name</label>
          <input id="inputName" type="text" className="form-control"
            value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="inputDesc">Description</label>
          <textarea id="inputDesc" className="form-control" rows={3}
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Updating…' : 'Update'}
          </button>
        </div>
      </form>
    </section>
  )
}
