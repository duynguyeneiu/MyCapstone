'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

// --- Types ---
interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  subTotal: number
  imageUrl: string
}

// TODO: lấy dữ liệu giỏ hàng từ context / store / API
const mockCartItems: CartItem[] = []

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(mockCartItems)

  const total = items.reduce((sum, i) => sum + i.subTotal, 0)

  const updateQty = (productId: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
              subTotal: item.price * Math.max(1, item.quantity + delta),
            }
          : item,
      ),
    )
    // TODO: gọi API update cart
  }

  const removeItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
    // TODO: gọi API remove from cart
  }

  return (
    <>
      {/* Search Modal */}
      <div className="modal fade" id="searchModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content rounded-0">
            <div className="modal-header">
              <h5 className="modal-title">Search by keyword</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body d-flex align-items-center">
              <div className="input-group w-75 mx-auto d-flex">
                <input type="search" className="form-control p-3" placeholder="keywords" />
                <span className="input-group-text p-3"><i className="fa fa-search"></i></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Page */}
      <div className="container-fluid py-5">
        <div className="container py-5">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Products</th>
                  <th scope="col">Name</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Total</th>
                  <th scope="col">Handle</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      Your cart is empty.{' '}
                      <Link href="/shop" className="text-primary">Continue shopping</Link>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.productId}>
                      <th scope="row">
                        <div className="d-flex align-items-center">
                          <Image
                            src={`/images/Products/${item.imageUrl}`}
                            className="img-fluid me-5 rounded-circle"
                            style={{ width: 80, height: 80, objectFit: 'cover' }}
                            alt={item.name}
                            width={80}
                            height={80}
                          />
                        </div>
                      </th>
                      <td>
                        <Link href={`/product/${item.productId}`}>
                          <p className="mb-0 mt-4">{item.name}</p>
                        </Link>
                      </td>
                      <td><p className="mb-0 mt-4">$ {item.price}</p></td>
                      <td>
                        <div className="input-group quantity mt-4" style={{ width: 100 }}>
                          <div className="input-group-btn">
                            <button
                              className="btn btn-sm btn-minus rounded-circle bg-light border"
                              onClick={() => updateQty(item.productId, -1)}
                            >
                              <i className="fa fa-minus"></i>
                            </button>
                          </div>
                          <input
                            type="text"
                            className="form-control form-control-sm text-center border-0"
                            value={item.quantity}
                            readOnly
                          />
                          <div className="input-group-btn">
                            <button
                              className="btn btn-sm btn-plus rounded-circle bg-light border"
                              onClick={() => updateQty(item.productId, 1)}
                            >
                              <i className="fa fa-plus"></i>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td><p className="mb-0 mt-4">$ {item.subTotal.toFixed(2)}</p></td>
                      <td>
                        <button
                          className="btn btn-md rounded-circle bg-light border mt-4"
                          onClick={() => removeItem(item.productId)}
                        >
                          <i className="fa fa-times text-danger"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Coupon + Total */}
          <div className="mt-5">
            <input
              type="text"
              className="border-0 border-bottom rounded me-5 py-3 mb-4"
              placeholder="Coupon Code"
            />
            <button className="btn border-secondary rounded-pill px-4 py-3 text-primary" type="button">
              Apply Coupon
            </button>
          </div>

          <div className="row g-4 justify-content-end">
            <div className="col-8"></div>
            <div className="col-sm-8 col-md-7 col-lg-6 col-xl-4">
              <div className="bg-light rounded">
                <div className="p-4">
                  <h1 className="display-6 mb-4">
                    Cart <span className="fw-normal">Total</span>
                  </h1>
                  <div className="d-flex justify-content-between mb-4">
                    <h5 className="mb-0 me-4">Subtotal:</h5>
                    <p className="mb-0">${total.toFixed(2)}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-0 me-4">Shipping</h5>
                    <p className="mb-0">Flat rate: $0.00</p>
                  </div>
                </div>
                <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between">
                  <h5 className="mb-0 ps-4 me-4">Total</h5>
                  <p className="mb-0 pe-4">${total.toFixed(2)}</p>
                </div>
                <Link
                  href="/cart/checkout"
                  className="btn border-secondary rounded-pill px-4 py-3 text-primary text-uppercase mb-4 ms-4"
                >
                  Proceed Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
