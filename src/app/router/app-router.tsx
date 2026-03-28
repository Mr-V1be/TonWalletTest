import {
  RouterProvider,
  createRouter,
} from '@tanstack/react-router';
import { routeTree } from '@/app/router/route-tree';

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
