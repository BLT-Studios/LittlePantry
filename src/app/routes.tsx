import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { Suspense } from 'react';
import { PublicOnly } from '@shared/routes/PublicOnly';
import { RequireAuth } from '@shared/routes/RequireAuth';
import { RootLayout } from '@shared/components/layout/RootLayout';

const routes = createBrowserRouter([
  {
    element: <PublicOnly />,
    children: [
      {
        path: '/login',
        lazy: async () => ({
          Component: (await import('@features/auth/pages/loginPage')).default,
        }),
      },
      {
        path: '/buttons',
        lazy: async () => ({
          Component: (
            await import('@features/auth/pages/ButtonGroupDefaultExample')
          ).default,
        }),
      },
      {
        path: '/signup',
        lazy: async () => ({
          Component: (await import('@features/auth/pages/signupPage')).default,
        }),
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <RootLayout />,
        children: [
          {
            // more pages here that require authentication(dashboard etc)
          },
        ],
      },
    ],
  },

  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default function AppRoutes() {
  return (
    <Suspense fallback={'Loading...'}>
      <RouterProvider router={routes} />
    </Suspense>
  );
}