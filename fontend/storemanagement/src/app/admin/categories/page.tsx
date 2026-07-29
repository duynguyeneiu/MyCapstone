'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { categoryService } from '@/src/services/categoryService'
import { Category } from '@/src/lib/data'

export default function CategoryTablePage() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch((err) => console.error(err))
  }, [])

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
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((item) => (
            <tr key={item.id}>
              <th scope="row">{item.id}</th>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>
                <div className="btn-group" role="group">
                  <Link href={`/admin/categories/${item.id}/edit`} className="btn btn-warning">Edit</Link>
                  <Link href={`/admin/categories/${item.id}/delete`} className="btn btn-danger">Delete</Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
