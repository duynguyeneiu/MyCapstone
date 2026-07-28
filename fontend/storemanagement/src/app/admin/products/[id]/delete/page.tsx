'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Product {
  productId: number
  name: string
  imageUrl: string
  price: number
}

export default function DeleteProductPage() {
  const router = useRouter()
  const params = useParams()
  const id     = params.id as string
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    // TODO: fetch product by id
    // fetch(`/api/products/${id}`).then(r => r.json()).then(setProduct)
    setProduct({ productId: Number(id), name: 'Sample Product', imageUrl: 'sample.jpg', price: 0 })
  }, [id])

  const handleDelete = async () => {
    // TODO: await fetch(`/api/products/${id}`, { method: 'DELETE' })
    console.log('Delete product:', id)
    router.push('/admin/products')
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
              <Image src={`/images/Products/${product.imageUrl}`} alt={product.name}
                width={100} height={100} style={{ objectFit: 'cover', borderRadius: 8 }} />
            </div>
            <p className="mb-1"><strong>{product.name}</strong></p>
            <p className="text-muted mb-4">$ {product.price}</p>
            <p className="text-danger mb-4">This action cannot be undone.</p>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-danger px-4" onClick={handleDelete}>
                Confirm Delete
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
