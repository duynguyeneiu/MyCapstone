'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import CartIcon from './CartIcon'

// TODO: thay thế bằng auth context / session thực tế của bạn
// Ví dụ dùng next-auth: import { useSession } from 'next-auth/react'
const useAuth = () => ({
  isAuthenticated: false,
  roleId: null as string | null,
  userId: null as string | null,
})

export default function Navbar() {
  const pathname = usePathname()
  const { isAuthenticated, roleId, userId } = useAuth()

  const isActive = (segment: string) =>
    pathname.startsWith(segment) ? 'active' : ''

  return (
    <div className="container-fluid fixed-top">
      {/* Topbar */}
      <div className="container-fluid topbar bg-primary d-none d-lg-block">
        <div className="d-flex justify-content-between imformation-web">
          <div className="top-info ps-2">
            <small className="me-3">
              <i className="fas fa-map-marker-alt me-2 text-secondary"></i>
              <a href="#" className="text-white">Dx003, Phú Mỹ, Thủ Dầu Một, Bình Dương</a>
            </small>
            <small className="me-3">
              <i className="fas fa-envelope me-2 text-secondary"></i>
              <a href="#" className="text-white">Mellorie@gmail.com</a>
            </small>
          </div>
          <div className="top-link pe-2">
            <a href="#" className="text-white"><small className="text-white mx-2">Privacy Policy</small>/</a>
            <a href="#" className="text-white"><small className="text-white mx-2">Terms of Use</small>/</a>
            <a href="#" className="text-white"><small className="text-white ms-2">Sales and Refunds</small></a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="container px-0">
        <nav className="navbar navbar-light bg-white navbar-expand-xl">
          <Link href="/" className="navbar-brand">
            <h1 className="text-primary display-6">Mallorie Cosmetic</h1>
          </Link>
          <button
            className="navbar-toggler py-2 px-3"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
          >
            <span className="fa fa-bars text-primary"></span>
          </button>

          <div className="collapse navbar-collapse bg-white" id="navbarCollapse">
            <div className="navbar-nav mx-auto">
              <Link href="/" className={`nav-item nav-link menu ${pathname === '/' ? 'active' : ''}`}>
                Home
              </Link>
              <Link href="/shop" className={`nav-item nav-link menu ${isActive('/shop')}`}>
                Shop
              </Link>
              <a href="#footer-contact" className="nav-item nav-link menu">Contact</a>

              {isAuthenticated && roleId === '1' && (
                <Link href="/chat/inbox" className={`nav-item nav-link menu ${isActive('/chat')}`}>
                  Chat
                </Link>
              )}
              {isAuthenticated && roleId === '3' && (
                <Link href="/chat/support" className={`nav-item nav-link menu ${isActive('/chat')}`}>
                  Chat
                </Link>
              )}
              {isAuthenticated && roleId === '1' && (
                <Link href="/admin/dashboard" className={`nav-item nav-link menu ${isActive('/admin')}`}>
                  Admin Page
                </Link>
              )}
            </div>

            <div className="d-flex m-3 me-0">
              {/* Search button */}
              <button
                className="btn-search btn border border-secondary btn-md-square rounded-circle bg-white me-4"
                data-bs-toggle="modal"
                data-bs-target="#searchModal"
              >
                <i className="fas fa-search text-primary"></i>
              </button>

              {/* Cart icon */}
              <CartIcon />

              {!isAuthenticated ? (
                <>
                  <Link href="/login" className="nav-item nav-link menu">Login</Link>
                  <Link href="/register" className="nav-item nav-link menu">Register</Link>
                </>
              ) : (
                <>
                  <Link href={`/profile`} className="my-auto">
                    <i className="fas fa-user fa-2x"></i>
                  </Link>
                  {/* TODO: thay bằng form logout thực tế (next-auth signOut hoặc API call) */}
                  <button
                    type="button"
                    className="btn btn-link nav-link text-dark"
                    onClick={() => { /* signOut() hoặc gọi API logout */ }}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Search Modal */}
      <div className="modal fade" id="searchModal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content rounded-0">
            <div className="modal-header">
              <h5 className="modal-title">Search by keyword</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body d-flex align-items-center">
              <form
                className="input-group w-75 mx-auto d-flex"
                action="/shop"
                method="get"
              >
                <input
                  type="search"
                  name="searchString"
                  className="form-control p-3"
                  placeholder="keywords"
                />
                <button type="submit" className="input-group-text p-3">
                  <i className="fa fa-search"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
