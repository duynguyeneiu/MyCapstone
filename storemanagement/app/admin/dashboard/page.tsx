'use client'

import { useEffect } from 'react'
import Image from 'next/image'

// --- Types ---
interface RecentOrder {
  orderId: number
  customerName: string
  date: string
  itemCount: number
  totalAmount: number
  status: string
}
interface DashboardData {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  recentOrders: RecentOrder[]
}

// TODO: fetch từ API
const mockData: DashboardData = {
  totalRevenue: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalProducts: 0,
  recentOrders: [],
}

declare const $: any

export default function DashboardPage() {
  const data = mockData

  // Status buttons logic
  useEffect(() => {
    if (typeof $ === 'undefined') return

    function setRowStatus($row: any, status: string) {
      $row.find('.js-status-text').text(status)
      const $btns = $row.find('.js-status-btn')
      $btns.removeClass('is-active')
      $btns.filter(`[data-status="${status}"]`).addClass('is-active')
      const $dot = $row.find('.tm-status-circle')
      $dot.removeClass('pending shipping delivered moving cancelled')
      $dot.addClass((status || 'Pending').toLowerCase())
    }

    $('tr[data-order-id]').each(function (this: any) {
      const $row = $(this)
      const current = ($row.find('.js-status-text').text() || '').trim()
      setRowStatus($row, current || 'Pending')
    })

    $(document).on('click', '.js-status-btn', function (this: any) {
      const $btn   = $(this)
      const status = $btn.data('status')
      const $row   = $btn.closest('tr[data-order-id]')
      setRowStatus($row, status)
      // TODO: gọi API PATCH /api/orders/:id/status
    })
  }, [])

  const notifications = [
    { img: '/images/notification-01.jpg', text: <><b>Jessica Lee</b> has placed a new order.</>, time: '6h ago' },
    { img: '/images/notification-02.jpg', text: <><b>Oliver Smith</b> has cancelled an order.</>, time: '6h ago' },
    { img: '/images/notification-03.jpg', text: <><b>Emily Brown</b> has placed a new order.</>, time: '6h ago' },
    { img: '/images/notification-01.jpg', text: <><b>Laura Cute</b> has cancelled an order.</>, time: '6h ago' },
    { img: '/images/notification-02.jpg', text: <><b>Samantha</b> has placed a new order.</>, time: '6h ago' },
    { img: '/images/notification-03.jpg', text: <><b>Sophie</b> has cancelled an order.</>, time: '6h ago' },
  ]

  return (
    <div className="container">
      <div className="row tm-content-row">

        {/* ── KPI Cards ── */}
        <div className="col-12 kpi-row">
          <div className="row mb-4">
            {[
              { icon: 'fas fa-dollar-sign', title: 'Total Revenue', value: `${data.totalRevenue.toLocaleString()} USD`, sub: 'Since launch' },
              { icon: 'fas fa-shopping-bag', title: 'Orders', value: data.totalOrders, sub: 'Since launch' },
              { icon: 'fas fa-users', title: 'Customers', value: data.totalCustomers, sub: 'Since launch' },
              { icon: 'fas fa-box-open', title: 'Products', value: data.totalProducts, sub: 'Active' },
            ].map((kpi) => (
              <div key={kpi.title} className="col-sm-12 col-md-6 col-lg-3">
                <div className="tm-bg-primary-dark tm-block text-center">
                  <i className={`${kpi.icon} fa-2x mb-2`}></i>
                  <h3 className="tm-block-title">{kpi.title}</h3>
                  <h2>{kpi.value}</h2>
                  <p className="tm-small">{kpi.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Charts (placeholders – dùng Chart.js hoặc recharts) ── */}
        <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6 tm-block-col">
          <div className="tm-bg-primary-dark tm-block">
            <h2 className="tm-block-title">Monthly Revenue</h2>
            <canvas id="lineChart"></canvas>
          </div>
        </div>
        <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6 tm-block-col">
          <div className="tm-bg-primary-dark tm-block">
            <h2 className="tm-block-title">Top Selling Products</h2>
            <canvas id="barChart"></canvas>
          </div>
        </div>
        <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6 tm-block-col">
          <div className="tm-bg-primary-dark tm-block tm-block-taller">
            <h2 className="tm-block-title">Inventory Status</h2>
            <div id="pieChartContainer">
              <canvas id="pieChart" width={200} height={200}></canvas>
            </div>
          </div>
        </div>

        {/* ── Notifications ── */}
        <div className="col-sm-12 col-md-12 col-lg-6 col-xl-6 tm-block-col">
          <div className="tm-bg-primary-dark tm-block tm-block-taller tm-block-overflow">
            <h2 className="tm-block-title">Notification List</h2>
            <div className="tm-notification-items">
              {notifications.map((n, idx) => (
                <div key={idx} className="tm-notification-item">
                  <div className="tm-gray-circle">
                    <Image src={n.img} alt="Avatar" width={80} height={80} style={{ objectFit: 'cover', borderRadius: '50%' }} />
                  </div>
                  <div className="media-body">
                    <p className="mb-2">{n.text}</p>
                    <span className="tm-small tm-text-color-secondary">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Orders List ── */}
        <div className="col-12 tm-block-col">
          <div className="tm-bg-primary-dark tm-block tm-block-taller tm-block-overflow">
            <h2 className="tm-block-title">Orders List</h2>
            <div className="tm-orders-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>ORDER NO</th>
                    <th>CUSTOMER</th>
                    <th>DATE</th>
                    <th>ITEMS</th>
                    <th>TOTAL</th>
                    <th>PAYMENT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o) => {
                    const status = o.status || 'Pending'
                    return (
                      <tr key={o.orderId} data-order-id={o.orderId}>
                        <td>#OD {o.orderId}</td>
                        <td>{o.customerName}</td>
                        <td>{new Date(o.date).toLocaleDateString('en-GB')}</td>
                        <td>{o.itemCount}</td>
                        <td>{o.totalAmount.toLocaleString()} VND</td>
                        <td>COD</td>
                        <td className="tm-status-cell">
                          <div className="tm-status-actions js-status-actions">
                            {['Pending', 'Shipping', 'Delivered'].map((s) => (
                              <button
                                key={s}
                                type="button"
                                className={`tm-status-btn js-status-btn${status === s ? ' is-active' : ''}`}
                                data-status={s}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
