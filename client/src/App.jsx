import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import SupplierLayout from './components/supplier/SupplierLayout.jsx';
import Landing from './pages/Landing.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import AssistantPage from './pages/AssistantPage.jsx';
import SupplierDashboard from './pages/supplier/SupplierDashboard.jsx';
import SupplierProducts from './pages/supplier/SupplierProducts.jsx';
import ProductForm from './pages/supplier/ProductForm.jsx';
import SupplierOrders from './pages/supplier/SupplierOrders.jsx';
import SupplierProfile from './pages/supplier/SupplierProfile.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <FullScreenLoader />;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (user?.role !== role) {
    return <Navigate to={user?.role === 'supplier' ? '/supplier' : '/'} replace />;
  }
  return children;
}

function RequireOnboarded({ children }) {
  const { user } = useAuth();
  if (user && !user.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to={user.role === 'supplier' ? '/supplier' : '/'} replace />;
  return children;
}

export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm text-brand-700">Loading Astra Threads…</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Buyer + public */}
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/assistant" element={<AssistantPage />} />
        <Route path="/login" element={<RedirectIfAuthed><LoginPage /></RedirectIfAuthed>} />
        <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
        <Route
          path="/cart"
          element={
            <RequireOnboarded>
              <CartPage />
            </RequireOnboarded>
          }
        />
        <Route
          path="/checkout"
          element={
            <RequireAuth>
              <RequireOnboarded>
                <CheckoutPage />
              </RequireOnboarded>
            </RequireAuth>
          }
        />
        <Route
          path="/order-confirmation/:id"
          element={
            <RequireAuth>
              <OrderConfirmationPage />
            </RequireAuth>
          }
        />
        <Route
          path="/account"
          element={
            <RequireRole role="buyer">
              <AccountPage />
            </RequireRole>
          }
        />
      </Route>

      {/* Supplier console */}
      <Route
        path="/supplier"
        element={
          <RequireRole role="supplier">
            <SupplierLayout />
          </RequireRole>
        }
      >
        <Route index element={<SupplierDashboard />} />
        <Route path="products" element={<SupplierProducts />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="orders" element={<SupplierOrders />} />
        <Route path="profile" element={<SupplierProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
