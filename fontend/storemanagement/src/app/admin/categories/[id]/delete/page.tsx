'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { categoryService } from '@/src/services/categoryService'

export default function DeleteCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const id     = Number(params.id)
  const [name, setName] = useState('')

  useEffect(() => {
    categoryService.getById(id)
      .then((d) => setName(d.name))
      .catch((err) => console.error(err))
  }, [id])

  const handleDelete = async () => {
    try {
      await categoryService.delete(id)
      router.push('/admin/categories')
    } catch (err) {
      console.error(err)
      alert('Failed to delete category')
    }
  }

  return (
    <section className="List admin-content-wrap">
      <div className="container" style={{ maxWidth: 480, marginTop: 40 }}>
        <div className="card shadow-sm border-danger">
          <div className="card-body text-center p-5">
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h4 className="mb-3">Delete Category?</h4>
            <p className="mb-1"><strong>{name}</strong></p>
            <p className="text-danger mb-4">This action cannot be undone.</p>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-danger px-4" onClick={handleDelete}>Confirm Delete</button>
              <Link href="/admin/categories" className="btn btn-secondary px-4">Cancel</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
