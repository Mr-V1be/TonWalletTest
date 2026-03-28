import {
  createRootRoute,
  createRoute,
  lazyRouteComponent,
  redirect,
} from '@tanstack/react-router';
import { readProtectedRouteRedirect } from '@/features/unlock-wallet/wallet-session-store';
import { RootLayout } from '@/app/router/root-layout';

const AppShell = lazyRouteComponent(
  () => import('@/app/shell/app-shell'),
  'AppShell',
);
const CreateWalletPage = lazyRouteComponent(
  () =>
    import('@/features/create-wallet/create-wallet-page'),
  'CreateWalletPage',
);
const ImportWalletPage = lazyRouteComponent(
  () =>
    import('@/features/import-wallet/import-wallet-page'),
  'ImportWalletPage',
);
const ReceiveTonPage = lazyRouteComponent(
  () =>
    import('@/features/receive-ton/receive-ton-page'),
  'ReceiveTonPage',
);
const SendTonPage = lazyRouteComponent(
  () => import('@/features/send-ton/send-ton-page'),
  'SendTonPage',
);
const SettingsPage = lazyRouteComponent(
  () => import('@/features/settings/settings-page'),
  'SettingsPage',
);
const StartPage = lazyRouteComponent(
  () => import('@/features/unlock-wallet/start-page'),
  'StartPage',
);
const UnlockWalletPage = lazyRouteComponent(
  () =>
    import('@/features/unlock-wallet/unlock-wallet-page'),
  'UnlockWalletPage',
);
const WalletDashboardPage = lazyRouteComponent(
  () =>
    import(
      '@/features/wallet-dashboard/wallet-dashboard-page'
    ),
  'WalletDashboardPage',
);

const rootRoute = createRootRoute({
  component: RootLayout,
});

const startRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: StartPage,
});

const createWalletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: CreateWalletPage,
});

const importWalletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/import',
  component: ImportWalletPage,
});

const unlockWalletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unlock',
  component: UnlockWalletPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  beforeLoad: () => {
    const redirectPath = readProtectedRouteRedirect();

    if (redirectPath) {
      throw redirect({
        to: redirectPath,
      });
    }
  },
  component: AppShell,
});

const walletRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/wallet',
  component: WalletDashboardPage,
});

const sendRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/send',
  component: SendTonPage,
});

const receiveRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/receive',
  component: ReceiveTonPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/settings',
  component: SettingsPage,
});

export const routeTree = rootRoute.addChildren([
  startRoute,
  createWalletRoute,
  importWalletRoute,
  unlockWalletRoute,
  appRoute.addChildren([
    walletRoute,
    sendRoute,
    receiveRoute,
    settingsRoute,
  ]),
]);
