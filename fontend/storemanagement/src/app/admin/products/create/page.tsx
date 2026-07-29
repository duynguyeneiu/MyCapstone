'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { productService, ApiProductRaw } from '@/src/services/productService'
import { categoryService } from '@/src/services/categoryService'
import { Category } from '@/src/lib/data'

export default function CreateProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', categoryId: '',
    price: '', quantity: '', barCode: '', image: '',
  })

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch((err) => console.error(err))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await productService.create({
        productId: 0,
        productCode: `PRD-${Date.now()}`,
        barcode: form.barCode || null,
        productName: form.name,
        unit: 'pcs',
        importPrice: Number(form.price) || 0,
        salePrice: Number(form.price) || 0,
        quantityInStock: Number(form.quantity) || 0,
        image: form.image || null,
        description: form.description,
        categoryId: Number(form.categoryId) || 0,
        status: 'Active',
      } as ApiProductRaw)
      router.push('/admin/products')
    } catch (err) {
      console.error(err)
      alert('Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="Create">
      <h3>Create new product</h3>
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-12">
          <label className="form-label" htmlFor="inputName">Name</label>
          <input id="inputName" name="name" type="text" className="form-control"
            value={form.name} onChange={handleChange} required />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="inputDesc">Description</label>
          <textarea id="inputDesc" name="description" className="form-control"
            value={form.description} onChange={handleChange} rows={3} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputCategory">Category</label>
          <select id="inputCategory" name="categoryId" className="form-select"
            value={form.categoryId} onChange={handleChange} required>
            <option value="">--Choose Category--</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputPrice">Price</label>
          <input id="inputPrice" name="price" type="number" min={0} step="any"
            className="form-control" value={form.price} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputQty">Quantity</label>
          <input id="inputQty" name="quantity" type="number" min={0}
            className="form-control" value={form.quantity} onChange={handleChange} />
        </div>
        <div className="col-6">
          <label className="form-label" htmlFor="inputBarCode">BarCode</label>
          <input id="inputBarCode" name="barCode" className="form-control"
            value={form.barCode} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputImage">Image filename</label>
          <input id="inputImage" name="image" type="text" className="form-control"
            placeholder="e.g. image1.png" value={form.image} onChange={handleChange} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </section>
  )
}
