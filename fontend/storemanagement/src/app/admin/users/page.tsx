import Link from 'next/link'
import { userService, ApiUser } from '@/src/services/userService'

async function getUsers(): Promise<ApiUser[]> {
  try {
    return await userService.getAll()
  } catch (err) {
    console.error('Failed to load users:', err)
    return []
  }
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
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((item) => (
            <tr key={item.userId}>
              <th scope="row">{item.userId}</th>
              <td>{item.fullName}</td>
              <td>{item.phone}</td>
              <td>{item.email}</td>
              <td>{item.address}</td>
              <td>{item.role?.roleName ?? item.roleId}</td>
              <td>{item.status}</td>
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
