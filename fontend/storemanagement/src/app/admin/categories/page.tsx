import Image from 'next/image'
import Link from 'next/link'

interface Category {
  categoryId: number
  name: string
  avatar: string
}

async function getCategories(): Promise<Category[]> {
  // TODO: fetch('/api/categories')
  return []
}

export default async function CategoryTablePage() {
  const categories = await getCategories()

  return (
    <section className="Categorylist List">
      <div className="blank"></div>
      <Link href="/admin/categories/create" className="btn btn-primary mb-3">
        + Add new category
      </Link>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Image</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((item) => (
            <tr key={item.categoryId}>
              <th scope="row">{item.categoryId}</th>
              <td>
                <Image src={`/images/Products/${item.avatar}`} alt={item.name}
                  width={50} height={50} style={{ objectFit: 'cover' }} />
              </td>
              <td>{item.name}</td>
              <td>
                <div className="btn-group" role="group">
                  <Link href={`/admin/categories/${item.categoryId}/edit`} className="btn btn-warning">Edit</Link>
                  <Link href={`/admin/categories/${item.categoryId}/delete`} className="btn btn-danger">Delete</Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
