import Image from 'next/image'
import Link from 'next/link'

interface User {
  userId: number
  fullname: string
  avatar: string
  phone: string
  email: string
  address: string
  roleName: string
}

async function getUsers(): Promise<User[]> {
  // TODO: fetch('/api/users')
  return []
}

export default async function UserTablePage() {
  const users = await getUsers()

  return (
    <section className="UserList List">
      <div className="blank"></div>
      <Link href="/admin/users/create" className="btn btn-primary mb-3">
        + Create new user
      </Link>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>Avatar</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((item) => (
            <tr key={item.userId}>
              <th scope="row">{item.userId}</th>
              <td>
                <Image src={`/images/Users/${item.avatar}`} alt={item.fullname}
                  width={50} height={50} className="user-img"
                  style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '50%' }} />
              </td>
              <td>{item.fullname}</td>
              <td>{item.phone}</td>
              <td>{item.email}</td>
              <td>{item.address}</td>
              <td>{item.roleName}</td>
              <td>
                <div className="btn-group" role="group">
                  <Link href={`/admin/users/${item.userId}/edit`} className="btn btn-warning">View</Link>
                  <Link href={`/admin/users/${item.userId}/delete`} className="btn btn-danger">Delete</Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
