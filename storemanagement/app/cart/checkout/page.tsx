'use client'

import Image from 'next/image'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

// --- Types ---
interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  subTotal: number
  imageUrl: string
}
interface CheckoutForm {
  fullName: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  notes: string
  paymentMethod: string
}

// TODO: lấy cart items từ store / API
const mockCartItems: CartItem[] = []

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems] = useState<CartItem[]>(mockCartItems)
  const [form, setForm] = useState<CheckoutForm>({
    fullName: '', address: '', city: '', country: '',
    phone: '', email: '', notes: '', paymentMethod: 'cod',
  })

  const total = cartItems.reduce((s, i) => s + i.subTotal, 0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // TODO: gọi API đặt hàng
    // const res = await fetch('/api/orders', { method: 'POST', body: JSON.stringify({ ...form, cartItems }) })
    // if (res.ok) router.push('/profile')
    console.log('Order placed:', form)
    router.push('/profile')
  }

  return (
    <div className="container-fluid py-5">
      <div className="container py-5">
        <h1 className="mb-4">Billing details</h1>
        <form onSubmit={handleSubmit}>
          <div className="row g-5">
            {/* Billing form */}
            <div className="col-md-12 col-lg-6 col-xl-7">
              <div className="row">
                <div className="col-12">
                  <div className="form-item w-100">
                    <label className="form-label my-3">Full Name</label>
                    <input name="fullName" value={form.fullName} onChange={handleChange}
                      className="form-control" required />
                  </div>
                </div>
              </div>
              <div className="form-item">
                <label className="form-label my-3">Address <sup>*</sup></label>
                <input name="address" value={form.address} onChange={handleChange}
                  className="form-control" required />
              </div>
              <div className="form-item">
                <label className="form-label my-3">Town/City <sup>*</sup></label>
                <input name="city" value={form.city} onChange={handleChange}
                  className="form-control" required />
              </div>
              <div className="form-item">
                <label className="form-label my-3">Country <sup>*</sup></label>
                <input name="country" value={form.country} onChange={handleChange}
                  className="form-control" required />
              </div>
              <div className="form-item">
                <label className="form-label my-3">Mobile <sup>*</sup></label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="form-control" type="tel" required />
              </div>
              <div className="form-item">
                <label className="form-label my-3">Email Address <sup>*</sup></label>
                <input name="email" value={form.email} onChange={handleChange}
                  className="form-control" type="email" required />
              </div>
              <hr />
              <div className="form-item">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="form-control"
                  cols={30}
                  rows={11}
                  placeholder="Order Notes (Optional)"
                />
              </div>
            </div>

            {/* Order summary */}
            <div className="col-md-12 col-lg-6 col-xl-5">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Products</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.productId}>
                        <th scope="row">
                          <div className="d-flex align-items-center mt-2">
                            <Image
                              src={`/images/Products/${item.imageUrl}`}
                              className="img-fluid rounded-circle"
                              style={{ width: 90, height: 90, objectFit: 'cover' }}
                              alt={item.name}
                              width={90}
                              height={90}
                            />
                          </div>
                        </th>
                        <td className="py-5">{item.name}</td>
                        <td className="py-5">{item.price}</td>
                        <td className="py-5">{item.quantity}</td>
                        <td className="py-5">{item.subTotal}</td>
                      </tr>
                    ))}
                    <tr>
                      <th></th>
                      <td className="py-5"><p className="mb-0 text-dark py-3">Shipping Cost</p></td>
                      <td className="py-5"></td>
                      <td className="py-5">
                        <div className="py-3 border-bottom border-top">
                          <p className="mb-0 text-dark">$ 0</p>
                        </div>
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <th></th>
                      <td className="py-5"><p className="mb-0 text-dark text-uppercase py-3">TOTAL</p></td>
                      <td className="py-5"></td>
                      <td className="py-5">
                        <div className="py-3 border-bottom border-top">
                          <p className="mb-0 text-dark">$ {total.toFixed(2)}</p>
                        </div>
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment methods */}
              <div className="row g-4 text-center align-items-center justify-content-center border-bottom py-3">
                <div className="col-12">
                  <div className="form-check text-start my-3">
                    <input
                      type="radio"
                      className="form-check-input bg-primary border-0"
                      id="pay-cod"
                      name="paymentMethod"
                      value="cod"
                      checked={form.paymentMethod === 'cod'}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="pay-cod">Cash On Delivery</label>
                  </div>
                </div>
              </div>
              <div className="row g-4 text-center align-items-center justify-content-center border-bottom py-3">
                <div className="col-12">
                  <div className="form-check text-start my-3">
                    <input
                      type="radio"
                      className="form-check-input bg-primary border-0"
                      id="pay-paypal"
                      name="paymentMethod"
                      value="paypal"
                      checked={form.paymentMethod === 'paypal'}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="pay-paypal">Paypal</label>
                  </div>
                </div>
              </div>

              <div className="row g-4 text-center align-items-center justify-content-center pt-4">
                <button
                  type="submit"
                  className="btn border-secondary py-3 px-4 text-uppercase w-100 text-primary"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
