import Image from 'next/image'
import Link from 'next/link'

interface Product {
  productId: number
  name: string
  imageUrl: string
  categoryName: string
  brandName: string
  price: number
  quantity: number
  barCode: string
}

// TODO: fetch từ API
async function getProducts(): Promise<Product[]> { return [] }

export default async function ProductTablePage() {
  const products = await getProducts()

  return (
    <section className="ProductList List">
      <div className="blank"></div>
      <Link href="/admin/products/create" className="btn btn-primary mb-3">
        + Create new product
      </Link>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>BarCode</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((item) => (
            <tr key={item.productId}>
              <th scope="row">{item.productId}</th>
              <td>
                <Image
                  src={`/images/Products/${item.imageUrl}`}
                  alt={item.name}
                  width={50}
                  height={50}
                  style={{ objectFit: 'cover' }}
                />
              </td>
              <td>{item.name}</td>
              <td>{item.categoryName}</td>
              <td>{item.brandName}</td>
              <td>{item.price}</td>
              <td>{item.quantity}</td>
              <td>{item.barCode}</td>
              <td>
                <div className="btn-group" role="group">
                  <Link href={`/admin/products/${item.productId}/edit`} className="btn btn-warning">
                    Edit
                  </Link>
                  <Link href={`/admin/products/${item.productId}/delete`} className="btn btn-danger">
                    Delete
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
