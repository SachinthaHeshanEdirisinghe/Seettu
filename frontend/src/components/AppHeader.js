function AppHeader({ theme, onToggleTheme, onSignOut, children }) {
  return (
    <header className="mc-header">
      <div className="mc-brand">
        <div className="mc-logo" aria-hidden>
          M
        </div>
        <div className="mc-title-block">
          <h1>Seettu LK</h1>
          <p>Group buying — pool orders, split smarter.</p>
        </div>
      </div>
      {children}
      <button
        type="button"
        className="mc-theme-toggle"
        onClick={onToggleTheme}
        aria-pressed={theme === 'dark'}
      >
        {theme === 'dark' ? 'Light mode' : 'Dark mode'}
      </button>
      <button type="button" className="mc-theme-toggle" onClick={onSignOut}>
        Sign out
      </button>
    </header>
  );
}

export default AppHeader;
