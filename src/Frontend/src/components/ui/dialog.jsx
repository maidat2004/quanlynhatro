import * as React from "react"

const DialogContext = React.createContext({ onOpenChange: undefined })

const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => onOpenChange && onOpenChange(false)}
          />
          <div className="relative z-50 flex w-full max-w-[calc(100vw-2rem)] justify-center mx-4">
            {children}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ children, asChild, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, props)
  }
  return <div {...props}>{children}</div>
}

const DialogContent = ({ className = "", children, ...props }) => {
  const { onOpenChange } = React.useContext(DialogContext)

  return (
    <div
      className={`relative bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto ${className}`}
      onClick={(event) => event.stopPropagation()}
      {...props}
    >
      {onOpenChange && (
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-800"
          aria-label="Đóng"
        >
          ×
        </button>
      )}
      {children}
    </div>
  )
}

const DialogHeader = ({ className = "", children, ...props }) => {
  return (
    <div
      className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 pr-10 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

const DialogTitle = ({ className = "", children, ...props }) => {
  return (
    <h2
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h2>
  )
}

const DialogDescription = ({ className = "", children, ...props }) => {
  return (
    <p
      className={`text-sm text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription }
