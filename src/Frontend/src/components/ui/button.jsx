export function Button({ className = '', variant = 'default', children, type = 'button', ...props }) {
  const baseClasses = 'app-button px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    default: 'app-button-primary bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'app-button-outline border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'app-button-ghost text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
