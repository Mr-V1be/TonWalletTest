import type { WalletSessionVaultPort } from '@/core/application/ports/wallet-session-vault-port';

export class InMemoryWalletSessionVault
  implements WalletSessionVaultPort
{
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();
  private readonly sessions = new Map<
    string,
    {
      cipherText: ArrayBuffer;
      iv: Uint8Array;
      key: CryptoKey;
    }
  >();

  clear(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  async create(mnemonic: string[]) {
    const sessionId = crypto.randomUUID();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    );
    const plaintext = this.encoder.encode(
      JSON.stringify(mnemonic),
    );
    const cipherText = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      plaintext,
    );

    plaintext.fill(0);
    this.sessions.set(sessionId, {
      cipherText,
      iv,
      key,
    });

    return sessionId;
  }

  async read(sessionId: string) {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    try {
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: Uint8Array.from(session.iv),
        },
        session.key,
        session.cipherText,
      );
      const bytes = new Uint8Array(decrypted);
      const parsed = JSON.parse(
        this.decoder.decode(bytes),
      );

      bytes.fill(0);

      return Array.isArray(parsed)
        ? parsed.filter(
            (item): item is string =>
              typeof item === 'string',
          )
        : null;
    } catch {
      this.clear(sessionId);
      return null;
    }
  }
}
