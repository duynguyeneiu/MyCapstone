import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <div className="container-fluid bg-dark text-white-50 footer pt-5 mt-5" id="footer-contact">
      <div className="container py-5">
        {/* Top row */}
        <div className="pb-4 mb-4" style={{ borderBottom: '1px solid rgba(226, 175, 24, 0.5)' }}>
          <div className="row g-4">
            <div className="col-lg-3">
              <a href="#">
                <h1 className="text-primary mb-0 footer-name">Mallorie</h1>
                <p className="text-secondary mb-0">Cosmetic products</p>
              </a>
            </div>
            <div className="col-lg-6">
              <div className="position-relative mx-auto">
                <input
                  className="form-control border-0 w-100 py-3 px-4 rounded-pill"
                  type="email"
                  placeholder="Your Email"
                />
                <button
                  type="button"
                  className="btn btn-primary border-0 border-secondary py-3 px-4 position-absolute rounded-pill text-white"
                  style={{ top: 0, right: 0 }}
                >
                  Subscribe Now
                </button>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="d-flex justify-content-end pt-3">
                <a className="btn btn-outline-secondary me-2 btn-md-square rounded-circle" href="#"><i className="fab fa-twitter"></i></a>
                <a className="btn btn-outline-secondary me-2 btn-md-square rounded-circle" href="#"><i className="fab fa-facebook-f"></i></a>
                <a className="btn btn-outline-secondary me-2 btn-md-square rounded-circle" href="#"><i className="fab fa-youtube"></i></a>
                <a className="btn btn-outline-secondary btn-md-square rounded-circle" href="#"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="row g-5">
          <div className="col-lg-3 col-md-6">
            <div className="footer-item">
              <h4 className="text-light mb-3">Why People Like us!</h4>
              <p className="mb-4">
                typesetting, remaining essentially unchanged. It was popularised in the 1960s
                with the like Aldus PageMaker including of Lorem Ipsum.
              </p>
              <a href="#" className="btn border-secondary py-2 px-4 rounded-pill text-primary">
                Read More
              </a>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="d-flex flex-column text-start footer-item">
              <h4 className="text-light mb-3">Shop Info</h4>
              <a className="btn-link" href="#">Contact Us</a>
              <a className="btn-link" href="#">Privacy Policy</a>
              <a className="btn-link" href="#">Terms &amp; Condition</a>
              <a className="btn-link" href="#">FAQs &amp; Help</a>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="d-flex flex-column text-start footer-item">
              <h4 className="text-light mb-3">Account</h4>
              <a className="btn-link" href="#">My Account</a>
              <Link className="btn-link" href="/shop">Shop details</Link>
              <Link className="btn-link" href="/cart">Shopping Cart</Link>
              <a className="btn-link" href="#">Order History</a>
            </div>
          </div>

          <div className="col-lg-3 col-md-6">
            <div className="footer-item">
              <h4 className="text-light mb-3">Contact</h4>
              <p>Address: Ho Chi Minh City</p>
              <p>Email: Mellorie@gmail.com</p>
              <p>Phone: +0123 4567 8910</p>
              <p>Payment Accepted</p>
              <Image src="/images/payment.png" className="img-fluid" alt="Payment methods" width={200} height={40} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
