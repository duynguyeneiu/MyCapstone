'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { productService, ApiProductRaw } from '@/src/services/productService'
import { categoryService } from '@/src/services/categoryService'
import { Category } from '@/src/lib/data'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id     = Number(params.id)

  const [raw, setRaw] = useState<ApiProductRaw | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    name: '', description: '', categoryId: '',
    price: '', quantity: '', barcode: '', image: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [product, categoriesData] = await Promise.all([
          productService.getRawById(id),
          categoryService.getAll(),
        ])
        setRaw(product)
        setCategories(categoriesData)
        setForm({
          name: product.productName,
          description: product.description ?? '',
          categoryId: String(product.categoryId),
          price: String(product.salePrice),
          quantity: String(product.quantityInStock),
          barcode: product.barcode ?? '',
          image: product.image ?? '',
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!raw) return
    setSaving(true)
    try {
      await productService.update(id, {
        ...raw,
        productName: form.name,
        description: form.description,
        categoryId: Number(form.categoryId) || raw.categoryId,
        salePrice: Number(form.price) || 0,
        quantityInStock: Number(form.quantity) || 0,
        barcode: form.barcode,
        image: form.image,
      })
      router.push('/admin/products')
    } catch (err) {
      console.error(err)
      alert('Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <section className="EditProduct List"><p>Loading…</p></section>

  return (
    <section className="EditProduct List">
      <h3>Edit product information</h3>
      <form className="row g-3" onSubmit={handleSubmit}>
        <div className="col-12">
          <label className="form-label" htmlFor="inputName">Name</label>
          <input id="inputName" name="name" type="text" className="form-control"
            value={form.name} onChange={handleChange} />
        </div>
        <div className="col-12">
          <label className="form-label" htmlFor="inputDesc">Description</label>
          <textarea id="inputDesc" name="description" className="form-control"
            value={form.description} onChange={handleChange} rows={3} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputCategory">Category</label>
          <select id="inputCategory" name="categoryId" className="form-select"
            value={form.categoryId} onChange={handleChange}>
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
          <input id="inputBarCode" name="barcode" className="form-control"
            value={form.barcode} onChange={handleChange} />
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputImage">Image filename</label>
          <input id="inputImage" name="image" type="text" className="form-control"
            placeholder="e.g. image1.png" value={form.image} onChange={handleChange} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Updating…' : 'Update'}
          </button>
        </div>
      </form>
    </section>
  )
}
