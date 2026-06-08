import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../lib/constants';

// Public Layout wrapper
import MainLayout from '../components/layout/MainLayout';

// Public Feature Pages
import HomePage from '../features/home/HomePage';
import AboutIntanPage from '../features/about-intan/AboutIntanPage';
import AboutIntaniumPage from '../features/about-intanium/AboutIntaniumPage';
import MerchandisePage from '../features/merchandise/MerchandisePage';
import MerchDetailPage from '../features/merchandise/MerchDetailPage';
import PaymentConfirmPage from '../features/merchandise/PaymentConfirmPage';
import RecapListPage from '../features/recaps/RecapListPage';
import RecapDetailPage from '../features/recaps/RecapDetailPage';
import SchedulePage from '../features/schedule/SchedulePage';
import IntanShiningStarPage from '../features/intan-shining-star/IntanShiningStarPage';
import FanartPage from '../features/fanart/FanartPage';
import DengerIntanPage from '../features/denger-intan/DengerIntanPage';
import MadingPage from '../features/mading/MadingPage';
import NewsPage from '../features/news/NewsPage';
import NewsDetailPage from '../features/news/NewsDetailPage';
import GalleryPage from '../features/gallery/GalleryPage';

// Admin Layout & View Pages
import AdminLayout from '../admin/AdminLayout';
import LoginPage from '../admin/LoginPage';
import DashboardPage from '../admin/DashboardPage';
import AdminMerchandise from '../admin/merchandise';
import AdminCategories from '../admin/merchandise/categories';
import AdminOrders from '../admin/orders';
import AdminRecaps from '../admin/recaps';
import AdminSchedule from '../admin/schedule';
import AdminNews from '../admin/news';
import AdminGallery from '../admin/gallery';
import AdminMading from '../admin/mading';
import AdminPlaylists from '../admin/playlists';
import AdminAboutIntan from '../admin/about-intan';

// Reusable Admin Guard Route
const AdminGuard = ({ children }) => {
  const isAuth = localStorage.getItem('isAdminAuthenticated') === 'true';
  return isAuth ? <AdminLayout>{children}</AdminLayout> : <Navigate to={ROUTES.ADMIN_LOGIN} replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================= PUBLIC USER ROUTES ================= */}
      <Route
        path="/"
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.ABOUT_INTAN}
        element={
          <MainLayout>
            <AboutIntanPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.ABOUT_INTANIUM}
        element={
          <MainLayout>
            <AboutIntaniumPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.MERCHANDISE}
        element={
          <MainLayout>
            <MerchandisePage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.MERCH_DETAIL}
        element={
          <MainLayout>
            <MerchDetailPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.PAYMENT_CONFIRM}
        element={
          <MainLayout>
            <PaymentConfirmPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.RECAPS}
        element={
          <MainLayout>
            <RecapListPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.RECAP_DETAIL}
        element={
          <MainLayout>
            <RecapDetailPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.SCHEDULE}
        element={
          <MainLayout>
            <SchedulePage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.SHINING_STAR}
        element={
          <MainLayout>
            <IntanShiningStarPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.FANART}
        element={
          <MainLayout>
            <FanartPage />
          </MainLayout>
        }
      />

      <Route
        path={ROUTES.DENGER_INTAN}
        element={
          <MainLayout>
            <DengerIntanPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.MADING}
        element={
          <MainLayout>
            <MadingPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.NEWS}
        element={
          <MainLayout>
            <NewsPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.NEWS_DETAIL}
        element={
          <MainLayout>
            <NewsDetailPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.GALLERY}
        element={
          <MainLayout>
            <GalleryPage />
          </MainLayout>
        }
      />

      {/* ================= ADMIN MANAGEMENT PORTAL ROUTES ================= */}
      <Route path={ROUTES.ADMIN_LOGIN} element={<LoginPage />} />
      
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <AdminGuard>
            <DashboardPage />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_ABOUT_INTAN}
        element={
          <AdminGuard>
            <AdminAboutIntan />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_MERCHANDISE}
        element={
          <AdminGuard>
            <AdminMerchandise />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_CATEGORIES}
        element={
          <AdminGuard>
            <AdminCategories />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_ORDERS}
        element={
          <AdminGuard>
            <AdminOrders />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_RECAPS}
        element={
          <AdminGuard>
            <AdminRecaps />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_SCHEDULE}
        element={
          <AdminGuard>
            <AdminSchedule />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_NEWS}
        element={
          <AdminGuard>
            <AdminNews />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_GALLERY}
        element={
          <AdminGuard>
            <AdminGallery />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_MADING}
        element={
          <AdminGuard>
            <AdminMading />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_PLAYLISTS}
        element={
          <AdminGuard>
            <AdminPlaylists />
          </AdminGuard>
        }
      />

      {/* Fallback route redirection */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
