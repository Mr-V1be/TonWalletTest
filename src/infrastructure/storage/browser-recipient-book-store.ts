import type {
  RecipientBookPort,
  RecipientBookSnapshot,
} from '@/core/application/ports/recipient-book-port';
import { readWalletRecordStrict } from '@/infrastructure/storage/wallet-record-storage';
import { updateWalletRecord } from '@/infrastructure/storage/wallet-record-storage';

const MAX_RECENT_RECIPIENTS = 10;

export class BrowserRecipientBookStore
  implements RecipientBookPort
{
  async appendRecentRecipient(address: string) {
    await updateWalletRecord((record) => ({
      ...record,
      recentRecipients: [
        address,
        ...record.recentRecipients.filter(
          (item) => item !== address,
        ),
      ].slice(0, MAX_RECENT_RECIPIENTS),
    }));
  }

  async readSnapshot(): Promise<RecipientBookSnapshot> {
    const record = readWalletRecordStrict();

    return {
      recentRecipients: record?.recentRecipients ?? [],
      trustedAddresses: record?.trustedAddresses ?? [],
    };
  }

  async setTrustedAddress(
    address: string,
    trusted: boolean,
  ) {
    await updateWalletRecord((record) => ({
      ...record,
      trustedAddresses: trusted
        ? Array.from(
            new Set([address, ...record.trustedAddresses]),
          )
        : record.trustedAddresses.filter(
            (item) => item !== address,
          ),
    }));
  }
}
