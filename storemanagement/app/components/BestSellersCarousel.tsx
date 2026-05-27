'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export interface Product {
  productId: number
  name: string
  description: string
  price: number
  imageUrl: string
}

interface Props {
  products: Product[]
}

// Owl Carousel được init qua jQuery/CDN (đã load ở layout.tsx)
// useEffect đảm bảo code chỉ chạy client-side
declare const $: any

export default function BestSellersCarousel({ products }: Props) {
  useEffect(() => {
    if (typeof $ !== 'undefined') {
      $('.vegetable-carousel').owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        margin: 25,
        loop: true,
        center: true,
        dots: false,
        nav: true,
        navText: [
          '<i class="bi bi-chevron-left"></i>',
          '<i class="bi bi-chevron-right"></i>',
        ],
        responsive: {
          0:   { items: 1 },
          768: { items: 2 },
          992: { items: 3 },
        },
      })
    }
  }, [])

  return (
    <div className="container-fluid vesitable py-5">
      <div className="container py-5">
        <h1 className="mb-0">Best Sellers</h1>
        <div className="owl-carousel vegetable-carousel justify-content-center">
          {products.map((item) => (
            <div
              key={item.productId}
              className="border border-primary rounded position-relative vesitable-item"
            >
              <Link href={`/product/${item.productId}`}>
                <div className="vesitable-img">
                  <Image
                    src={`/images/Products/${item.imageUrl}`}
                    className="img-fluid w-100 rounded-top"
                    alt={item.name}
                    width={294}
                    height={294}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="p-4 rounded-bottom">
                  <h4 className="product-name">{item.name}</h4>
                  <p className="product-name">{item.description}</p>
                  <div className="d-flex justify-content-between flex-lg-wrap">
                    <p className="text-dark fs-5 fw-bold mb-0">$ {item.price}</p>
                    {/* TODO: kết nối addToCart action */}
                    <button className="btn border border-secondary rounded-pill px-3 text-primary">
                      <i className="fa fa-shopping-bag me-2 text-primary"></i> Buy
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
