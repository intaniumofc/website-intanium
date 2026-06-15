import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../lib/constants';
import Loading from '../components/common/Loading';

// Public Layout wrapper
import MainLayout from '../components/layout/MainLayout';

// Public Feature Pages (Lazy Loaded)
const HomePage = lazy(() => import('../features/home/HomePage'));
const AboutIntanPage = lazy(() => import('../features/about-intan/AboutIntanPage'));
const AboutIntaniumPage = lazy(() => import('../features/about-intanium/AboutIntaniumPage'));
const MerchandisePage = lazy(() => import('../features/merchandise/MerchandisePage'));
const MerchDetailPage = lazy(() => import('../features/merchandise/MerchDetailPage'));
const PaymentConfirmPage = lazy(() => import('../features/merchandise/PaymentConfirmPage'));
const RecapListPage = lazy(() => import('../features/recaps/RecapListPage'));
const RecapDetailPage = lazy(() => import('../features/recaps/RecapDetailPage'));
const SchedulePage = lazy(() => import('../features/schedule/SchedulePage'));
const IntanShiningStarPage = lazy(() => import('../features/intan-shining-star/IntanShiningStarPage'));
const FanartPage = lazy(() => import('../features/fanart/FanartPage'));
const DengerIntanPage = lazy(() => import('../features/denger-intan/DengerIntanPage'));
const MadingPage = lazy(() => import('../features/mading/MadingPage'));
const NewsPage = lazy(() => import('../features/news/NewsPage'));
const NewsDetailPage = lazy(() => import('../features/news/NewsDetailPage'));
const GalleryPage = lazy(() => import('../features/gallery/GalleryPage'));
const GamesPage = lazy(() => import('../features/games/GamesPage'));
const MenangkapKecoaPage = lazy(() => import('../features/games/menangkap-kecoa/MenangkapKecoaPage'));
const ScoreResultPage = lazy(() => import('../features/games/menangkap-kecoa/ScoreResultPage'));
const EsportPage = lazy(() => import('../features/esport/EsportPage'));

// Admin Layout & View Pages (Lazy Loaded)
const AdminLayout = lazy(() => import('../admin/AdminLayout'));
const LoginPage = lazy(() => import('../admin/LoginPage'));
const DashboardPage = lazy(() => import('../admin/DashboardPage'));
const AdminMerchandise = lazy(() => import('../admin/merchandise'));
const AdminCategories = lazy(() => import('../admin/merchandise/categories'));
const AdminOrders = lazy(() => import('../admin/orders'));
const AdminRecaps = lazy(() => import('../admin/recaps'));
const AdminSchedule = lazy(() => import('../admin/schedule'));
const AdminNews = lazy(() => import('../admin/news'));
const AdminGallery = lazy(() => import('../admin/gallery'));
const AdminMading = lazy(() => import('../admin/mading'));
const AdminPlaylists = lazy(() => import('../admin/playlists'));
const AdminAboutIntan = lazy(() => import('../admin/about-intan'));
const AdminIntanShiningStar = lazy(() => import('../admin/intan-shining-star'));
const AdminHashtags = lazy(() => import('../admin/hashtags'));
const AdminGames = lazy(() => import('../admin/games'));
const AdminEsport = lazy(() => import('../admin/esport/AdminEsportPage'));
const AdminMembershipPage = lazy(() => import('../admin/membership/AdminMembershipPage'));

import { AdminToastProvider } from '../components/common/AdminToastProvider';

// Reusable Admin Guard Route
const AdminGuard = ({ children }) => {
  const isAuth = localStorage.getItem('isAdminAuthenticated') === 'true';
  return isAuth ? (
    <AdminToastProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminToastProvider>
  ) : (
    <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  );
};

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading fullPage message="Memuat halaman..." />}>
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
      <Route
        path={ROUTES.GAMES}
        element={
          <MainLayout>
            <GamesPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.GAME_MENANGKAP_KECOA}
        element={
          <MainLayout>
            <MenangkapKecoaPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.GAME_MENANGKAP_KECOA_RESULT}
        element={
          <MainLayout>
            <ScoreResultPage />
          </MainLayout>
        }
      />
      <Route
        path={ROUTES.ESPORT}
        element={
          <MainLayout>
            <EsportPage />
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
        path={ROUTES.ADMIN_SHINING_STAR}
        element={
          <AdminGuard>
            <AdminIntanShiningStar />
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
      <Route
        path={ROUTES.ADMIN_HASHTAGS}
        element={
          <AdminGuard>
            <AdminHashtags />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_GAMES}
        element={
          <AdminGuard>
            <AdminGames />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_ESPORT}
        element={
          <AdminGuard>
            <AdminEsport />
          </AdminGuard>
        }
      />
      <Route
        path={ROUTES.ADMIN_MEMBERSHIP}
        element={
          <AdminGuard>
            <AdminMembershipPage />
          </AdminGuard>
        }
      />

      {/* Fallback route redirection */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
