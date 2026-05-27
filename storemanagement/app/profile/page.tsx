import Image from 'next/image'
import Link from 'next/link'

// --- Types ---
interface OrderHistoryItem {
  orderId: number
  date: string
  totalAmount: number
  status: string
}
interface UserProfile {
  userId: number
  fullname: string
  description: string
  email: string
  phone: string
  address: string
  avatar: string
}

// TODO: lấy thông tin user từ session / API
async function getUserProfile(): Promise<UserProfile> {
  return {
    userId: 1,
    fullname: 'Nguyễn Văn A',
    description: 'Cosmetic lover',
    email: 'user@example.com',
    phone: '0901234567',
    address: 'Ho Chi Minh City',
    avatar: 'default.jpg',
  }
}

async function getOrderHistory(): Promise<OrderHistoryItem[]> {
  // TODO: fetch orders từ API
  return []
}

function statusBadgeClass(status: string) {
  const map: Record<string, string> = {
    Delivered: 'oh-b-delivered',
    Shipping:  'oh-b-shipping',
    Cancelled: 'oh-b-cancelled',
  }
  return map[status] ?? ''
}

export default async function ProfilePage() {
  const user   = await getUserProfile()
  const orders = await getOrderHistory()

  return (
    <section className="books-detail">
      <h3 className="section-title fw-bold text-center">Profile Information</h3>
      <div className="container">
        {/* Avatar + Info */}
        <div className="row">
          <div className="col-5 image-profile">
            <Image
              className="img-fluid rounded"
              src={`/images/Users/${user.avatar}`}
              alt={user.fullname}
              width={400}
              height={400}
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="col-7 image-profile">
            <div className="book-info">
              <p><span>Full Name: </span>{user.fullname}</p>
              <p><span>Description: </span>{user.description}</p>
              <p><span>Email: </span>{user.email}</p>
              <p><span>Phone: </span>{user.phone}</p>
              <p><span>Address: </span>{user.address}</p>
              <Link href={`/profile/edit`} className="btn btn-primary">Edit Detail</Link>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="row mt-5">
          <div className="oh-container oh-wrap">
            <div className="oh-header">
              <div>
                <h2 className="oh-title">Purchase History</h2>
                <p className="oh-subtitle">View and track your previous orders.</p>
              </div>
            </div>

            <div className="oh-card">
              <table className="oh-table">
                <thead className="oh-thead">
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="oh-tbody">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        You haven&apos;t placed any orders yet.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.orderId}>
                        <td data-label="Order">#{order.orderId}</td>
                        <td data-label="Date">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td data-label="Total">{order.totalAmount.toLocaleString()} $</td>
                        <td data-label="Status">
                          <span className={`oh-badge ${statusBadgeClass(order.status)}`}>
                            <span className="oh-dot"></span>
                            {order.status}
                          </span>
                        </td>
                        <td data-label="Actions">
                          <div className="oh-actions">
                            <Link className="oh-btn oh-btn--primary" href={`/orders/${order.orderId}`}>
                              View details
                            </Link>
                            <a className="oh-btn" href="#">Buy again</a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
