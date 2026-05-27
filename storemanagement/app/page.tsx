import Image from 'next/image'
import Link from 'next/link'
import BestSellersCarousel from './components/BestSellersCarousel'

// --- Types ---
interface Product {
  productId: number
  name: string
  description: string
  price: number
  imageUrl: string
}

// TODO: thay bằng fetch API thực tế
async function getProducts(): Promise<Product[]> {
  // Ví dụ: const res = await fetch(`${process.env.API_URL}/api/products/new-arrival`)
  return []
}

async function getFavProducts(): Promise<Product[]> {
  // Ví dụ: const res = await fetch(`${process.env.API_URL}/api/products/best-sellers`)
  return []
}

export default async function HomePage() {
  const products = await getProducts()
  const favProducts = await getFavProducts()

  return (
    <>
      {/* === HERO BANNER (Carousel) === */}
      <div id="carouselExampleInterval" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleInterval" data-bs-slide-to={0}
            className="active" aria-current="true" aria-label="Slide 1" />
          <button type="button" data-bs-target="#carouselExampleInterval" data-bs-slide-to={1} aria-label="Slide 2" />
          <button type="button" data-bs-target="#carouselExampleInterval" data-bs-slide-to={2} aria-label="Slide 3" />
        </div>
        <div className="carousel-inner cosmetic-banner">
          <div className="carousel-item active" data-bs-interval={10000}>
            <Image src="/images/Banner/Banner.jpg" className="d-block w-100" alt="Banner 1"
              width={1920} height={550} priority style={{ objectFit: 'cover', maxHeight: 550 }} />
          </div>
          <div className="carousel-item" data-bs-interval={2000}>
            <Image src="/images/Banner/Banner1.jpg" className="d-block w-100" alt="Banner 2"
              width={1920} height={550} style={{ objectFit: 'cover', maxHeight: 550 }} />
          </div>
          <div className="carousel-item">
            <Image src="/images/Banner/Banner2.jpg" className="d-block w-100" alt="Banner 3"
              width={1920} height={550} style={{ objectFit: 'cover', maxHeight: 550 }} />
          </div>
        </div>
        <button className="carousel-control-prev" type="button"
          data-bs-target="#carouselExampleInterval" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button"
          data-bs-target="#carouselExampleInterval" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      {/* === NEW ARRIVAL === */}
      <div className="container-fluid fruite py-5">
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-lg-6 text-start">
              <h1>New Arrival</h1>
            </div>
            <div className="col-lg-6 text-end"></div>

            {products.map((item) => (
              <div key={item.productId} className="col-md-6 col-lg-4 col-xl-3">
                <Link href={`/product/${item.productId}`}>
                  <div className="rounded position-relative h-100 fruite-item">
                    <div className="fruite-img">
                      <Image
                        src={`/images/Products/${item.imageUrl}`}
                        className="img-fluid w-100 rounded-top"
                        alt={item.name}
                        width={294}
                        height={294}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="p-4 border border-secondary border-top-0 rounded-bottom">
                      <h4 className="product-name">{item.name}</h4>
                      <p className="product-name">{item.description}</p>
                      <div className="d-flex justify-content-between flex-lg-wrap">
                        <p className="text-dark fs-5 fw-bold mb-0">$ {item.price}</p>
                        {/* TODO: kết nối addToCart */}
                        <button className="btn border border-secondary rounded-pill px-3 text-primary">
                          <i className="fa fa-shopping-bag me-2 text-primary"></i> Buy
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === BEST SELLERS (Owl Carousel – Client Component) === */}
      <BestSellersCarousel products={favProducts} />

      {/* === FEATURES === */}
      <div className="container-fluid featurs py-5 mb-3">
        <div className="container py-5">
          <div className="row g-4">
            {[
              { icon: 'fas fa-car-side', title: 'Free Shipping', desc: 'Free on order over $300' },
              { icon: 'fas fa-user-shield', title: 'Security Payment', desc: '100% security payment' },
              { icon: 'fas fa-exchange-alt', title: '30 Day Return', desc: '30 day money guarantee' },
              { icon: 'fa fa-phone-alt', title: '24/7 Support', desc: 'Support every time fast' },
            ].map((f) => (
              <div key={f.title} className="col-md-6 col-lg-3">
                <div className="featurs-item text-center rounded bg-light p-4">
                  <div className="featurs-icon btn-square rounded-circle bg-secondary mb-5 mx-auto">
                    <i className={`${f.icon} fa-3x text-white`}></i>
                  </div>
                  <div className="featurs-content text-center">
                    <h5>{f.title}</h5>
                    <p className="mb-0">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
