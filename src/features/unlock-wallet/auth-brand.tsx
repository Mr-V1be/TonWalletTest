import { House } from 'lucide-react';

export function AuthBrand() {
  return (
    <header className="auth-brand">
      <div className="auth-mark" aria-hidden="true">
        <House size={34} strokeWidth={1.9} />
      </div>
      <div>
        <h1 className="auth-title">Ethereal Vault</h1>
        <p className="auth-meta">TON TESTNET PROTOCOL</p>
      </div>
    </header>
  );
}
