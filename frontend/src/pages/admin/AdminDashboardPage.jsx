"use client"

import * as React from "react"
import { Link } from "react-router-dom"
import {
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiPlus,
  FiList,
} from "react-icons/fi"

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6">
      {/* Welcome Section */}
      <section className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Welcome to SuriAddis Admin</h2>
          <p className="text-slate-500 mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-md border border-slate-200 hover:bg-slate-50 text-sm">
            <FiPackage className="h-4 w-4" />
            <span>Export Data</span>
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm"
          >
            <FiPlus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Products</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-slate-900 mt-1">1,254</h3>
                <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +12%
                </span>
              </div>
            </div>
            <div className="bg-slate-100 p-3 rounded-full">
              <FiShoppingBag className="text-slate-700 h-5 w-5" />
            </div>
          </div>
          <div className="h-1 w-full bg-slate-100 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-slate-700 rounded-full" style={{ width: "75%" }}></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Orders</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-slate-900 mt-1">42</h3>
                <span className="text-xs font-medium text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">+5%</span>
              </div>
            </div>
            <div className="bg-slate-100 p-3 rounded-full">
              <FiPackage className="text-slate-700 h-5 w-5" />
            </div>
          </div>
          <div className="h-1 w-full bg-slate-100 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-slate-700 rounded-full" style={{ width: "42%" }}></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-slate-900 mt-1">3,879</h3>
                <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +18%
                </span>
              </div>
            </div>
            <div className="bg-slate-100 p-3 rounded-full">
              <FiUsers className="text-slate-700 h-5 w-5" />
            </div>
          </div>
          <div className="h-1 w-full bg-slate-100 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-slate-700 rounded-full" style={{ width: "65%" }}></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-slate-900 mt-1">$128,450</h3>
                <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +24%
                </span>
              </div>
            </div>
            <div className="bg-slate-100 p-3 rounded-full">
              <FiDollarSign className="text-slate-700 h-5 w-5" />
            </div>
          </div>
          <div className="h-1 w-full bg-slate-100 mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-slate-700 rounded-full" style={{ width: "85%" }}></div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
              <p className="text-sm text-slate-500">Frequently used operations</p>
            </div>
            <div className="p-6 space-y-4">
              <Link
                to="/admin/products/new"
                className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all group"
              >
                <div className="bg-slate-900 text-white p-3 rounded-lg group-hover:bg-slate-700 transition-colors">
                  <FiPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Add New Product</h3>
                  <p className="text-sm text-slate-500">Create a new product listing</p>
                </div>
              </Link>

              <Link
                to="/admin/categories"
                className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all group"
              >
                <div className="bg-slate-900 text-white p-3 rounded-lg group-hover:bg-slate-700 transition-colors">
                  <FiList className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">Manage Categories</h3>
                  <p className="text-sm text-slate-500">Organize product categories</p>
                </div>
              </Link>

              <Link
                to="/admin/orders"
                className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all group"
              >
                <div className="bg-slate-900 text-white p-3 rounded-lg group-hover:bg-slate-700 transition-colors">
                  <FiPackage className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900">View Orders</h3>
                  <p className="text-sm text-slate-500">Manage customer orders</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                <p className="text-sm text-slate-500">Latest updates from your store</p>
              </div>
              <div className="flex flex-wrap gap-1 rounded-md overflow-hidden border border-slate-200">
                <button className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm bg-slate-900 text-white">All</button>
                <button className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm hover:bg-slate-50">Orders</button>
                <button className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm hover:bg-slate-50">Users</button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-emerald-100 p-2 rounded-full mt-1 flex-shrink-0">
                    <FiUsers className="text-emerald-600 h-4 w-4" />
                  </div>
                  <div className="flex-1 border-b border-slate-100 pb-4">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1">
                      <p className="font-medium text-slate-900 text-sm sm:text-base">New user registered</p>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">
                        2 min ago
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 break-words">
                      John Doe (john@example.com) created a new account
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-blue-100 p-2 rounded-full mt-1 flex-shrink-0">
                    <FiPackage className="text-blue-600 h-4 w-4" />
                  </div>
                  <div className="flex-1 border-b border-slate-100 pb-4">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1">
                      <p className="font-medium text-slate-900 text-sm sm:text-base">New order received</p>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">
                        15 min ago
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 break-words">Order #38294 ($129.99) is awaiting processing</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="bg-violet-100 p-2 rounded-full mt-1 flex-shrink-0">
                    <FiShoppingBag className="text-violet-600 h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1">
                      <p className="font-medium text-slate-900 text-sm sm:text-base">New product added</p>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">
                        1 hour ago
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 break-words">
                      Premium Leather Bag was added to inventory (SKU: LB-2023)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
