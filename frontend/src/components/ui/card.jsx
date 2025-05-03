import React from "react"

export function Card({ className = "", children, ...props }) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`p-6 border-b border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h2 className={`text-lg font-semibold text-slate-900 ${className}`} {...props}>
      {children}
    </h2>
  )
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}
