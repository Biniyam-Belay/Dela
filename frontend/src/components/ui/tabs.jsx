import React, { useState, Children, cloneElement } from "react"

export function Tabs({ value, defaultValue, onValueChange, children, className = "" }) {
  const [active, setActive] = useState(defaultValue || (Array.isArray(children) && children[0]?.props?.value) || "")
  const controlled = value !== undefined
  const current = controlled ? value : active
  const setCurrent = (val) => {
    if (!controlled) setActive(val)
    if (onValueChange) onValueChange(val)
  }
  // Provide context via props
  return (
    <div className={className}>
      {Children.map(children, (child) =>
        child && child.type && [TabsList, TabsContent].includes(child.type)
          ? cloneElement(child, { active: current, setActive: setCurrent })
          : child
      )}
    </div>
  )
}

export function TabsList({ children, className = "", active, setActive, ...props }) {
  return (
    <div className={`flex gap-2 ${className}`} {...props}>
      {Children.map(children, (child) =>
        child && child.type === TabsTrigger
          ? cloneElement(child, {
              isActive: child.props.value === active,
              onClick: () => setActive(child.props.value),
            })
          : child
      )}
    </div>
  )
}

export function TabsTrigger({ value, children, isActive, onClick, className = "", ...props }) {
  return (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
        isActive
          ? "bg-slate-900 text-white shadow"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, active, children, className = "", ...props }) {
  if (value !== active) return null
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}
