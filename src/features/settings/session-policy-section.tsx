export function SessionPolicySection() {
  return (
    <section className="card-shell settings-card">
      <p className="card-shellEyebrow">Security</p>
      <h2 className="card-shellTitle">Session policy</h2>
      <div className="settings-policy">
        <p className="settings-copy">Current tab only</p>
        <p className="settings-copy">Auto-lock: 15 min</p>
        <p className="settings-copy">Local trusted addresses</p>
      </div>
    </section>
  );
}
