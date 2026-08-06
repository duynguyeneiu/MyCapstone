'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { userService } from '@/src/services/userService'

export default function DeleteUserPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    userService.getById(id)
      .then((u) => setName(u.fullName))
      .catch((err) => {
        console.error('Failed to load user:', err)
        setName(`User #${id}`)
      })
  }, [id])

  const handleDelete = async () => {
    setError(null)
    try {
      await userService.delete(id)
      router.push('/admin/users')
    } catch (err) {
      console.error('Failed to delete user:', err)
      setError('Failed to delete user.')
    }
  }

  return (
    <section className="List admin-content-wrap">
      <div className="container" style={{ maxWidth: 480, marginTop: 40 }}>
        <div className="card shadow-sm border-danger">
          <div className="card-body text-center p-5">
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h4 className="mb-3">Delete User?</h4>
            <p className="mb-1"><strong>{name}</strong></p>
            {error && <p className="text-danger">{error}</p>}
            <p className="text-danger mb-4">This action cannot be undone.</p>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-danger px-4" onClick={handleDelete}>Confirm Delete</button>
              <Link href="/admin/users" className="btn btn-secondary px-4">Cancel</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
