import * as React from "react"
import { ChevronDown } from "lucide-react"

const Select = ({ children, value, onValueChange }) => {
  const [open, setOpen] = React.useState(false)
  
  return (
    <div className="relative" style={{ zIndex: open ? 400 : 'auto' }}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange, open, setOpen, allChildren: children })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef(({ className = "", children, value, open, setOpen, onValueChange, allChildren, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setOpen && setOpen(!open)}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child) && child.type === SelectValue) {
          return React.cloneElement(child, { value, allChildren })
        }
        return child
      })}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, value, allChildren }) => {
  // Find label from allChildren based on value
  const findLabel = (children, targetValue) => {
    let label = ""
    React.Children.forEach(children, child => {
      if (React.isValidElement(child)) {
        if (child.props?.value === targetValue && child.props?.children) {
          label = child.props.children
        }
        if (!label && child.props?.children) {
          const nestedLabel = findLabel(child.props.children, targetValue)
          if (nestedLabel) label = nestedLabel
        }
      }
    })
    return label
  }
  
  const label = value ? findLabel(allChildren, value) : ""
  return <span>{label || placeholder || "Select..."}</span>
}

const SelectContent = ({ className = "", children, open, setOpen, onValueChange, allChildren }) => {
  if (!open) return null
  
  return (
    <>
      <div 
        className="fixed inset-0 z-[100]" 
        onClick={() => {
          setOpen && setOpen(false)
        }}
      />
      <div
        className={`absolute mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg ${className}`}
        style={{ zIndex: 500, maxHeight: '240px', overflowY: 'auto' }}
      >
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { onValueChange, setOpen })
          }
          return child
        })}
      </div>
    </>
  )
}

const SelectItem = ({ className = "", children, value, onValueChange, setOpen, disabled = false, ...props }) => {
  return (
    <div
      className={`relative flex w-full select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100 focus:bg-gray-100'
      } ${className}`}
      onClick={() => {
        if (disabled) return
        onValueChange && onValueChange(value)
        setOpen && setOpen(false)
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
