import { LogoMark } from './Logo';

function SplashScreen() {
  return (
    <div className="splash" role="status" aria-live="polite">
      <LogoMark size={52} />
      <span className="splash__text">Loading your circles…</span>
    </div>
  );
}

export default SplashScreen;
