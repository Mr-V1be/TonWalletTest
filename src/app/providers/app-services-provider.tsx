import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { PropsWithChildren } from 'react';
import { createWalletUseCase } from '@/core/application/use-cases/create-wallet';
import { importWalletUseCase } from '@/core/application/use-cases/import-wallet';
import { unlockWalletUseCase } from '@/core/application/use-cases/unlock-wallet';
import type { RecipientBookPort } from '@/core/application/ports/recipient-book-port';
import type { WalletSessionVaultPort } from '@/core/application/ports/wallet-session-vault-port';
import { configureWalletSessionVault } from '@/features/unlock-wallet/wallet-session-store';
import { WebCryptoCipher } from '@/infrastructure/crypto/web-crypto-cipher';
import { BrowserRecipientBookStore } from '@/infrastructure/storage/browser-recipient-book-store';
import { BrowserUnlockLockoutStore } from '@/infrastructure/storage/browser-unlock-lockout-store';
import { BrowserWalletStore } from '@/infrastructure/storage/browser-wallet-store';
import { InMemoryWalletSessionVault } from '@/infrastructure/storage/in-memory-wallet-session-vault';
import { TestnetTransferService } from '@/infrastructure/ton/testnet-transfer-service';
import { TestnetWalletService } from '@/infrastructure/ton/testnet-wallet-service';
import { ToncenterReadGateway } from '@/infrastructure/ton/toncenter-read-gateway';
import { createToncenterRpcClient } from '@/shared/config/toncenter-config';

export interface AppServices {
  blockchain: {
    readGateway: ToncenterReadGateway;
  };
  recipientBook: RecipientBookPort;
  transfer: {
    testnetTransfer: TestnetTransferService;
  };
  walletCore: {
    createWallet: ReturnType<typeof createWalletUseCase>;
    importWallet: ReturnType<typeof importWalletUseCase>;
    unlockWallet: ReturnType<typeof unlockWalletUseCase>;
  };
}

const AppServicesContext =
  createContext<AppServices | null>(null);

interface ServiceBundle {
  services: AppServices;
  sessionVault: WalletSessionVaultPort | null;
}

export function AppServicesProvider({
  children,
  services: injectedServices,
}: PropsWithChildren<{
  services?: AppServices;
}>) {
  const [bundle] = useState<ServiceBundle>(() =>
    injectedServices
      ? {
          services: injectedServices,
          sessionVault: null,
        }
      : createAppServices(),
  );

  useEffect(() => {
    if (!bundle.sessionVault) {
      return;
    }

    configureWalletSessionVault(bundle.sessionVault);
  }, [bundle.sessionVault]);

  return (
    <AppServicesContext.Provider
      value={bundle.services}
    >
      {children}
    </AppServicesContext.Provider>
  );
}

export function useAppServices() {
  const services = useContext(AppServicesContext);

  if (!services) {
    throw new Error(
      'App services are not available in this tree.',
    );
  }

  return services;
}

function createAppServices(): ServiceBundle {
  const cipher = new WebCryptoCipher();
  const readGateway = new ToncenterReadGateway();
  const recipientBook = new BrowserRecipientBookStore();
  const secretStore = new BrowserWalletStore();
  const sessionVault = new InMemoryWalletSessionVault();
  const tonWallet = new TestnetWalletService();

  return {
    services: {
      blockchain: {
        readGateway,
      },
      recipientBook,
      transfer: {
        testnetTransfer: new TestnetTransferService({
          client: createToncenterRpcClient(),
          readGateway,
          recipientBook,
          sessionVault,
        }),
      },
      walletCore: {
        createWallet: createWalletUseCase({
          cipher,
          secretStore,
          tonWallet,
        }),
        importWallet: importWalletUseCase({
          cipher,
          secretStore,
          tonWallet,
        }),
        unlockWallet: unlockWalletUseCase({
          cipher,
          lockoutStore: new BrowserUnlockLockoutStore(),
          secretStore,
          tonWallet,
        }),
      },
    },
    sessionVault,
  };
}
