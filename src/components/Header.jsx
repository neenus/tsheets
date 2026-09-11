const Header = ({ children }) => (
  <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 pt-[env(safe-area-inset-top)] backdrop-blur-lg print:hidden">
    <div className="mx-auto flex h-16 max-w-xl items-center justify-between gap-3 px-4">
      <p className="text-xl font-extrabold tracking-tight">
        T<span className="text-accent">Sheets</span>
      </p>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  </header>
);

export default Header;
