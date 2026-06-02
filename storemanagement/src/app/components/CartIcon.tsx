'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CartIcon() {
  const { cartCount } = useCart();

  return (
    <Link href="/cart" className="my-auto me-4 position-relative">
      <i className="fas fa-shopping-cart fa-2x text-primary"></i>
      {cartCount > 0 && (
        <span
          className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
          style={{ fontSize: '0.6rem' }}
        >
          {cartCount}
        </span>
      )}
    </Link>
  );
}
