import Link from 'next/link'

// --- Types ---
interface OrderDetail {
  productId: number
  quantity: number
  unitPrice: number
  product: { name: string }
}
interface Order {
  orderId: number
  date: string
  status: string
  totalAmount: number
  phone: string
  adress: string
  user?: { fullname: string }
  orderDetails: OrderDetail[]
}

// TODO: fetch order theo ID từ API
async function getOrder(id: string): Promise<Order> {
  return {
    orderId: Number(id),
    date: new Date().toISOString(),
    status: 'Delivered',
    totalAmount: 0,
    phone: '',
    adress: '',
    user: { fullname: 'Nguyễn Văn A' },
    orderDetails: [],
  }
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id)
  const subTotal = order.orderDetails.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  return (
    <section className="container py-5 od-wrap">
      <div className="od-card">

        {/* Header */}
        <div className="od-header">
          <div>
            <h5>Order #{order.orderId}</h5>
            <small>
              Placed on{' '}
              {new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </small>
            <span className="od-status">{order.status}</span>
          </div>
        </div>

        {/* Items */}
        <div className="od-section">
          <h6>Items</h6>
          {order.orderDetails.map((item, idx) => (
            <div key={idx} className="od-item">
              <span>
                {item.product.name}{' '}
                <small className="text-muted">({item.quantity})</small>
              </span>
              <strong>{(item.unitPrice * item.quantity).toFixed(2)} $</strong>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="od-section">
          <h6>Summary</h6>
          <div className="od-summary">
            <span>Subtotal</span>
            <span>{subTotal.toFixed(2)} $</span>
          </div>
          <div className="od-summary">
            <span>Shipping</span>
            <span>0 $</span>
          </div>
          <div className="od-summary od-total">
            <span>Total</span>
            <span>{order.totalAmount.toFixed(2)} $</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="od-section od-shipping">
          <h6>Shipping Information</h6>
          <p>{order.user?.fullname} – {order.phone}</p>
          <p>{order.adress}</p>
        </div>

        {/* Action */}
        <div className="od-section od-action">
          <Link href="/profile" className="od-btn-back">← Back</Link>
        </div>

      </div>
    </section>
  )
}
