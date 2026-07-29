'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { productService } from '@/src/services/productService'
import { Product } from '@/src/lib/data'
import { fmt } from '@/src/app/lib/utils'

export default function DeleteProductPage() {
  const router = useRouter()
  const params = useParams()
  const id     = Number(params.id)
  const [product, setProduct] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    productService.getById(id)
      .then(setProduct)
      .catch((err) => console.error(err))
  }, [id])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productService.delete(id)
      router.push('/admin/products')
    } catch (err) {
      console.error(err)
      alert('Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  if (!product) return <p className="p-4">Loading...</p>

  return (
    <section className="List admin-content-wrap">
      <div className="container" style={{ maxWidth: 520, marginTop: 40 }}>
        <div className="card shadow-sm border-danger">
          <div className="card-body text-center p-5">
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h4 className="mb-3">Delete Product?</h4>
            <div className="mb-3">
              <Image src={product.image} alt={product.name}
                width={100} height={100} style={{ objectFit: 'cover', borderRadius: 8 }} />
            </div>
            <p className="mb-1"><strong>{product.name}</strong></p>
            <p className="text-muted mb-4">{fmt(product.price)}</p>
            <p className="text-danger mb-4">This action cannot be undone.</p>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-danger px-4" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
              <Link href="/admin/products" className="btn btn-secondary px-4">
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
