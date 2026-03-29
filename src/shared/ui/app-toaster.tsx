import { Toaster } from 'sonner';

export function AppToaster() {
  return (
    <Toaster
      closeButton
      duration={3200}
      position="top-right"
      richColors={false}
      theme="dark"
      toastOptions={{
        className: 'app-toast',
      }}
    />
  );
}
