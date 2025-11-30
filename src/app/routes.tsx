import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { Suspense } from 'react';

const routes = createBrowserRouter([
  {
    children: [
      {
        path: '/login',
        lazy: async () => ({
          Component: (await import('@features/auth/pages/loginPage')).default,
        }),
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
