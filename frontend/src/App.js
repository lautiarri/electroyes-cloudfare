import "@/index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import { CartProvider } from "@/context/CartContext";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Navigate to="/tienda" replace />} />
          <Route
            path="/tienda"
            element={
              <Layout>
                <Catalog />
              </Layout>
            }
          />
          <Route
            path="/tienda/producto/:code"
            element={
              <Layout>
                <ProductDetail />
              </Layout>
            }
          />
          <Route
            path="/tienda/carrito"
            element={
              <Layout>
                <Cart />
              </Layout>
            }
          />
          <Route
            path="/tienda/checkout"
            element={
              <Layout>
                <Checkout />
              </Layout>
            }
          />
          <Route
            path="/tienda/confirmacion/:id"
            element={
              <Layout>
                <OrderConfirmation />
              </Layout>
            }
          />
          <Route path="/tienda/admin/login" element={<Layout><AdminLogin /></Layout>} />
          <Route path="/tienda/admin" element={<Layout><AdminDashboard /></Layout>} />
          <Route path="*" element={<Navigate to="/tienda" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
