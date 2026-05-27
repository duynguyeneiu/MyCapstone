'use client'

import Link from 'next/link'

// TODO: kết nối với cart context / zustand store thực tế của bạn
// Hiện tại là placeholder hiển thị icon giỏ hàng
export default function CartIcon() {
  // Ví dụ: const { itemCount } = useCartStore()
  const itemCount = 0

  return (
    <Link href="/cart" className="my-auto me-4 position-relative">
      <i className="fas fa-shopping-cart fa-2x text-primary"></i>
      {itemCount > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
          style={{ fontSize: '0.6rem' }}
        >
          {itemCount}
        </span>
      )}
    </Link>
  )
}
