'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

// --- Types ---
interface Product {
  productId: number
  name: string
  description: string
  price: number
  imageUrl: string
  barCode: string
  category?: { name: string }
  brand?: { name: string }
}

// TODO: thay bằng fetch API thực tế trong một server component bọc ngoài,
//       hoặc dùng useEffect để gọi từ client
const mockProduct: Product = {
  productId: 1,
  name: 'Sample Product',
  description: 'This is a sample description.',
  price: 29.99,
  imageUrl: 'sample.jpg',
  barCode: '123456789',
  category: { name: 'Skincare' },
  brand:    { name: 'Mallorie' },
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)

  // TODO: fetch product by params.id
  const product = mockProduct

  const handleAddToCart = () => {
    // TODO: gọi addToCart API hoặc update cart store
    console.log('Add to cart:', product.productId, 'qty:', quantity)
  }

  return (
    <section className="books-detail">
      <h3 className="section-title fw-bold text-center">Thông tin chi tiết</h3>
      <div className="container">
        <div className="row">
          {/* Product Image */}
          <div className="col-5 detail-page">
            <Image
              className="img-fluid"
              src={`/images/Products/${product.imageUrl}`}
              alt={product.name}
              width={500}
              height={500}
              style={{ objectFit: 'cover', borderRadius: 12 }}
            />
          </div>

          {/* Product Info */}
          <div className="col-7 detail-page">
            <div className="book-info">
              <h4>{product.name}</h4>
              <p><span>Description: </span>{product.description}</p>
              <p><span>Bar code: </span>{product.barCode}</p>
              <p><span>Type: </span>{product.category?.name ?? ''}</p>
              <p><span>Brand: </span>{product.brand?.name ?? ''}</p>
              <p className="text-dark fs-4 fw-bold">$ {product.price}</p>

              {/* Quantity selector */}
              <div className="col-lg-6">
                <div className="input-group quantity mb-5" style={{ width: 100 }}>
                  <div className="input-group-btn">
                    <button
                      className="btn btn-sm btn-minus rounded-circle bg-light border"
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <i className="fa fa-minus"></i>
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-control form-control-sm text-center border-0"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                    readOnly
                  />
                  <div className="input-group-btn">
                    <button
                      className="btn btn-sm btn-plus rounded-circle bg-light border"
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      <i className="fa fa-plus"></i>
                    </button>
                  </div>
                </div>
                <button
                  className="btn border border-secondary rounded-pill px-4 py-2 mb-4 text-primary"
                  onClick={handleAddToCart}
                >
                  <i className="fa fa-shopping-bag me-2 text-primary"></i> Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
