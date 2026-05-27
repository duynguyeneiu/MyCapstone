import Link from 'next/link'

// Admin layout: dùng chung Navbar (từ root layout) + sidebar riêng
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container admin-content-wrap">
      <div className="row">
        {/* Sidebar */}
        <div className="col-2">
          <nav className="admin-sidebar">
            <ul className="nav flex-column">
              <li className="nav-item">
                <Link className="nav-link" href="/admin/dashboard">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/admin/products">Products</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/admin/categories">Categories</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/admin/brands">Brands</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" href="/admin/users">Users</Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Content */}
        <div className="col-10">
          <div className="body-content">{children}</div>
        </div>
      </div>
    </div>
  )
}
