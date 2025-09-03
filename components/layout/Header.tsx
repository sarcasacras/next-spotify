export default function Header() {
  return (
    <header className="bg-surface border-b border-border h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left navigation section */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full cursor-pointer bg-surface-hover text-text-secondary hover:text-text-primary transition-colors">
            ←
          </button>
          <button className="p-2 rounded-full cursor-pointer bg-surface-hover text-text-secondary hover:text-text-primary transition-colors">
            →
          </button>
        </div>

        {/* Center search bar */}
        <div className="flex-1 max-w-md mx-8">
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-surface-hover rounded-full py-2 px-4 text-text-primary placeholder-text-secondary border border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        {/* Right user section */}
        <div className="flex items-center">
          <button className="px-4 py-2 cursor-pointer bg-primary text-text-primary rounded-full font-medium hover:bg-primary-hover transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </header>
  )
}
