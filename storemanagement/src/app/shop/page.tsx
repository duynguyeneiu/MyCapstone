import Image from 'next/image'
import Link from 'next/link'

// --- Types ---
interface Product {
  productId: number
  name: string
  description: string
  price: number
  imageUrl: string
  categoryId: number
}
interface Category {
  categoryId: number
  name: string
}

interface ShopPageProps {
  searchParams: { page?: string; pageSize?: string; searchString?: string; id?: string }
}

// TODO: thay bằng fetch API thực tế
async function getShopData(params: ShopPageProps['searchParams']) {
  const page       = Number(params.page      ?? 1)
  const pageSize   = Number(params.pageSize  ?? 9)
  const search     = params.searchString ?? ''
  const categoryId = params.id           ?? ''

  // const res = await fetch(`${process.env.API_URL}/api/products?page=${page}&pageSize=${pageSize}&search=${search}&categoryId=${categoryId}`)
  return {
    products:        [] as Product[],
    categories:      [] as Category[],
    totalPages:      1,
    currentPage:     page,
    currentSearch:   search,
    currentCategory: null as Category | null,
  }
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { products, categories, totalPages, currentPage, currentSearch, currentCategory } =
    await getShopData(searchParams)

  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const p = {
      page:         currentPage,
      pageSize:     9,
      searchString: currentSearch,
      id:           currentCategory?.categoryId,
      ...overrides,
    }
    const qs = Object.entries(p)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&')
    return `/shop?${qs}`
  }

  return (
    <>
      {/* Page Header */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6">Shop</h1>
        <ol className="breadcrumb justify-content-center mb-0">
          <li className="breadcrumb-item">
            <Link href="/" className="link-home">Home</Link>
          </li>
          <li className="breadcrumb-item active text-white">Shop</li>
        </ol>
      </div>

      {/* Shop Content */}
      <div className="container-fluid fruite py-5">
        <div className="container py-5">
          <h1 className="mb-4">Mallorie shop</h1>

          {currentSearch && <p>Search Result For: <strong>{currentSearch}</strong></p>}
          {currentCategory && <p>Category: <strong>{currentCategory.name}</strong></p>}

          <div className="row g-4">
            <div className="col-lg-12">
              {/* Search + Sort bar */}
              <div className="row g-4">
                <div className="col-xl-3">
                  <form method="get" action="/shop" className="input-group w-100 mx-auto d-flex">
                    <input
                      type="search"
                      className="form-control p-3"
                      name="searchString"
                      placeholder="keywords"
                      defaultValue={currentSearch}
                    />
                    <button type="submit" className="input-group-text p-3">
                      <i className="fa fa-search"></i>
                    </button>
                  </form>
                </div>
                <div className="col-6"></div>
                <div className="col-xl-3">
                  <div className="bg-light ps-3 py-3 rounded d-flex justify-content-between mb-4">
                    <label htmlFor="sortSelect">Default Sorting:</label>
                    <select id="sortSelect" className="border-0 form-select-sm bg-light me-3">
                      <option value="">Nothing</option>
                      <option value="popular">Popularity</option>
                      <option value="price-asc">Price Low–High</option>
                      <option value="price-desc">Price High–Low</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                {/* Sidebar – Categories */}
                <div className="col-lg-3">
                  <div className="mb-3">
                    <h4>Categories</h4>
                    <ul className="list-unstyled fruite-categorie">
                      <li>
                        <div className="d-flex justify-content-between fruite-name">
                          <Link href="/shop">All Categories</Link>
                        </div>
                      </li>
                      {categories.map((cat) => (
                        <li key={cat.categoryId}>
                          <div className="d-flex justify-content-between fruite-name">
                            <Link href={`/shop?id=${cat.categoryId}`}>{cat.name}</Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Product grid */}
                <div className="col-lg-9">
                  <div className="row g-4 justify-content-center">
                    {products.map((item) => (
                      <div key={item.productId} className="col-md-6 col-lg-6 col-xl-4">
                        <Link href={`/product/${item.productId}`}>
                          <div className="rounded position-relative fruite-item">
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
                                <p className="text-dark fs-5 fw-bold mb-0">{item.price} $</p>
                                {/* TODO: addToCart */}
                                <button className="btn border border-secondary rounded-pill px-3 text-primary">
                                  <i className="fa fa-shopping-bag me-2 text-primary"></i> Buy
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="pagination d-flex justify-content-center mt-5">
                        {currentPage > 1 && (
                          <Link className="rounded" href={buildHref({ page: currentPage - 1 })}>
                            &laquo;
                          </Link>
                        )}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((i) => (
                          <Link
                            key={i}
                            className={`rounded ${i === currentPage ? 'active' : ''}`}
                            href={buildHref({ page: i })}
                          >
                            {i}
                          </Link>
                        ))}
                        {currentPage < totalPages && (
                          <Link className="rounded" href={buildHref({ page: currentPage + 1 })}>
                            &raquo;
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
