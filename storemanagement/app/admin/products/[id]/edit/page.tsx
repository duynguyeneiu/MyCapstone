'use client'

import Image from 'next/image'
import { useState, FormEvent, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface SelectItem { value: string; text: string }

// TODO: fetch từ API
const mockBrands:     SelectItem[] = []
const mockCategories: SelectItem[] = []

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id     = params.id as string
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    productId: id,
    name: '', description: '', brandId: '', categoryId: '',
    price: '', quantity: '', barCode: '', imageUrl: '',
  })
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    // TODO: fetch product by id
    // fetch(`/api/products/${id}`).then(r => r.json()).then(data => setForm({...data}))
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.append(k, v))
    if (fileRef.current?.files?.[0]) formData.append('ImageFile', fileRef.current.files[0])
    // TODO: await fetch(`/api/products/${id}`, { method: 'PUT', body: formData })
    console.log('Update product:', form)
    router.push('/admin/products')
  }

  return (
    <section className="EditProduct List">
      <h3>Edit product information</h3>
      <form className="row g-3" onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="hidden" name="productId" value={form.productId} />

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
          <input ref={fileRef} id="inputImage" name="ImageFile" type="file"
            className="form-control" accept="image/*" onChange={handleFile} />
          <div className="mt-2">
            {preview
              ? <img src={preview} alt="Preview" style={{ maxWidth: '50%', height: 'auto' }} />
              : form.imageUrl && (
                  <Image src={`/images/Products/${form.imageUrl}`} alt="Current"
                    width={200} height={200} style={{ maxWidth: '50%', height: 'auto', objectFit: 'cover' }} />
                )
            }
          </div>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Update</button>
        </div>
      </form>
    </section>
  )
}
