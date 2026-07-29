'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { categoryService, ApiCategoryRaw } from '@/src/services/categoryService'

export default function CreateCategoryPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await categoryService.create({
        categoryId: 0,
        categoryName: name,
        description,
        parentCategoryId: null,
        status: 'Active',
      } as ApiCategoryRaw)
      router.push('/admin/categories')
    } catch (err) {
      console.error(err)
      alert('Failed to create category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="Create">
      <h3>Create new category</h3>
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
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </section>
  )
}
