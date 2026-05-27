import Image from 'next/image'
import Link from 'next/link'

interface Brand {
  brandId: number
  name: string
  logo: string
  description: string
}

async function getBrands(): Promise<Brand[]> {
  // TODO: fetch('/api/brands')
  return []
}

export default async function BrandTablePage() {
  const brands = await getBrands()

  return (
    <section className="Brandlist List">
      <div className="blank"></div>
      <Link href="/admin/brands/create" className="btn btn-primary mb-3">
        + Add new Brand
      </Link>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Logo</th>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((item) => (
            <tr key={item.brandId}>
              <th scope="row">{item.brandId}</th>
              <td>
                <Image src={`/images/Brands/${item.logo}`} alt={item.name}
                  width={50} height={50} style={{ objectFit: 'cover' }} className="brand-img" />
              </td>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>
                <div className="btn-group" role="group">
                  <Link href={`/admin/brands/${item.brandId}/edit`} className="btn btn-warning">Edit</Link>
                  <Link href={`/admin/brands/${item.brandId}/delete`} className="btn btn-danger">Delete</Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
