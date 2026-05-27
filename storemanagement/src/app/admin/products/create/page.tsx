'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

interface SelectItem { value: string; text: string }

// TODO: fetch danh sách brand + category từ API
const mockBrands:     SelectItem[] = []
const mockCategories: SelectItem[] = []

export default function CreateProductPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '', description: '', brandId: '', categoryId: '',
    price: '', quantity: '', barCode: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    if (imageFile) formData.append('ImageFile', imageFile)
    // TODO: await fetch('/api/products', { method: 'POST', body: formData })
    console.log('Create product:', form)
    router.push('/admin/products')
  }

  return (
    <section className="Create">
      <h3>Create new product</h3>
      <form className="row g-3" onSubmit={handleSubmit} encType="multipart/form-data">
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
          <label className="form-label" htmlFor="inputBrand">Brand</label>
          <select id="inputBrand" name="brandId" className="form-select"
            value={form.brandId} onChange={handleChange}>
            <option value="">--Choose Brand--</option>
            {mockBrands.map((b) => <option key={b.value} value={b.value}>{b.text}</option>)}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label" htmlFor="inputCategory">Type</label>
          <select id="inputCategory" name="categoryId" className="form-select"
            value={form.categoryId} onChange={handleChange}>
            <option value="">--Choose Type--</option>
            {mockCategories.map((c) => <option key={c.value} value={c.value}>{c.text}</option>)}
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
          <label className="form-label" htmlFor="inputImage">Image</label>
          <input id="inputImage" name="ImageFile" type="file" className="form-control"
            accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Create</button>
        </div>
      </form>
    </section>
  )
}
