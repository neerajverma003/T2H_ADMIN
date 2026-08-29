import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//import { useEffect } from "react"

// Layout
import AdminLayout from "./layouts/AdminLayout"

// Pages
import Login from "./pages/auth/Login"
import Dashboard from "./pages/dashboard/Dashboard"
import HeroContent from './pages/hero/HeroContent';
import HeroMedia from './pages/hero/HeroMedia';

import AddUser from "./pages/users/AddUser"
import UserList from "./pages/users/UsersList"
import ReferralAudit from "./pages/users/ReferralAudit"
import CreateDestination from "./pages/destinations/CreateDestination"
import CreateCity from "./pages/destinations/CreateCity"
import EditDestination from "./pages/destinations/EditPage"
import HoneymoonGallery from "./pages/customer-gallery/HoneymoonGallery"
import UploadVideoTestimonial from "./pages/testimonials/VideoTestimonials"
import PlanYourJourney from "./pages/leads/plan_your_journey/page"
import ContactUs from "./pages/leads/contact_us/page"
import ConsultationLeads from "./pages/leads/consulation_leads/page"
import Suggestions from "./pages/leads/suggesations/page"
import Subscribe from "./pages/leads/subscribes/page"
import HoneymoonTripRequests from "./pages/leads/plan_your_trip/page"
import ItineraryLeads from "./pages/leads/itinerary_leads/ItineraryLeads"
// Iteraries
import CreateItineriesPage from "./pages/itineraries/CreateItinerary"
import ItineraryListPage from "./pages/Itinerary_list/ItineraryList"
import ItineraryReviewApprovals from "./pages/itineraries/ItineraryReviewApprovals"

// Blogs
import CreateBlog from "./pages/blog/CreateBlog"
import BlogList from "./pages/blog/BlogsList"
// Honeymoon Resorts
import HoneymoonResortForm from "./pages/resorts/CreateResort"
import HoneymoonResortList from "./pages/resorts/ResortList"
import EditPage from "./pages/resorts/EditPage"
import ViewPage from "./pages/resorts/ViewPage"
// Hotels
import CreateHotel from "./pages/hotels/CreateHotel"
import HotelList from "./pages/hotels/HotelList"
import TestimonialListPage from "./pages/testimonials/TestimonialLists"
import WrittenTestimonials from "./pages/testimonials/WrittenTestimonials"
import WrittenTestimonialList from "./pages/testimonials/WrittenTestimonialList"
// Protected Route
import ProtectedRoutes from "./components/ProtectedRoutes"

import GlobalTerms from "./pages/global-terms/GlobalTerms"
import UserAgreementAdmin from "./pages/user-agreement/UserAgreement"
import HoneymoonCancellationPolicy from "./pages/cancellation-policy/page"
import HoneymoonPaymentMode from "./pages/payment-mode/page"
import HoneymoonTermsAndCondition from "./pages/terms-and-conditions/page"
import Reports from "./pages/reports/Reports"
import Settings from "./pages/settings/Settings"
import ReferralSettings from "./pages/settings/ReferralSettings"
import NotificationRecipients from "./pages/settings/NotificationRecipients"
import GstSettings from "./pages/settings/GstSettings"
import HomeStatsSettings from "./pages/settings/HomeStatsSettings"
import ChatbotSettings from "./pages/settings/ChatbotSettings"
import AuditLogs from "./pages/audit/AuditLogs"
import VerifyGiftCard from "./pages/giftcards/VerifyGiftCard"
import BulkGiftCard from "./pages/giftcards/BulkGiftCard"
import AboutSettings from "./pages/settings/AboutSettings"
import BookedPackages from "./pages/bookings/BookedPackages"

import CreateMember from "./pages/team/CreateMember"
import TeamList from "./pages/team/TeamList"
import SocialManagement from "./pages/social-management/page.jsx"
import EmailTemplates from "./pages/campaign_management/template.jsx"
import CampaignManagement from "./pages/campaign_management/page.jsx"

import CustomersList from "./pages/customers/CustomersList"
import CustomerDetails from "./pages/customers/CustomerDetails"



// Store
// import useAuthStore from "./stores/authStores"

function App() {
  // checkAuthOnLoad is called once in `main.jsx` — avoid calling it again here to prevent duplicate requests
  // const checkAuthOnLoad = useAuthStore((s) => s.checkAuthOnLoad)

  // useEffect(() => {
  //   checkAuthOnLoad()
  // }, [checkAuthOnLoad])
  const token = localStorage.getItem("token");
  //console.log(token);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover theme="dark" />
      <Routes>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<AdminLayout />}>

            {/* Team */}
            <Route path="team/create" element={<CreateMember />} />
            <Route path="team/list" element={<TeamList />} />
            <Route path="team/edit/:id" element={<CreateMember />} />

            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Users */}
            <Route path="users/add" element={<AddUser />} />
            <Route path="users/list" element={<UserList />} />
            <Route path="users/referrals" element={<ReferralAudit />} />

            {/* Destinations */}
            <Route path="destinations/create" element={<CreateDestination />} />
            <Route path="destinations/city" element={<CreateCity />} />
            <Route path="destinations/edit/:id" element={<EditDestination />} />

            {/* Gallery */}
            <Route path="gallery/images" element={<HoneymoonGallery />} />

            {/* Honeymoon Resorts */}
            <Route path="resorts/create" element={<HoneymoonResortForm />} />
            <Route path="resorts/list" element={<HoneymoonResortList />} />
            <Route path="resorts/edit/:id" element={<EditPage />} />
            <Route path="resorts/view/:id" element={<ViewPage />} />

            {/* Hotels */}
            <Route path="hotels/create" element={<CreateHotel />} />
            <Route path="hotels/list" element={<HotelList />} />
            <Route path="hotels/edit/:id" element={<CreateHotel />} />

            {/* Hero Section Management */}
            <Route path="hero-content" element={<HeroContent />} />
            <Route path="hero-media" element={<HeroMedia />} />

            {/* Blog (when ready) */}
            <Route path="blogs/create" element={<CreateBlog postType="blog" />} />
            <Route path="blogs/edit/:id" element={<CreateBlog postType="blog" />} />
            <Route path="blogs/list" element={<BlogList postType="blog" />} />

            {/*  Articles*/}
            <Route path="articles/create" element={<CreateBlog postType="article" />} />
            <Route path="articles/edit/:id" element={<CreateBlog postType="article" />} />
            <Route path="articles/list" element={<BlogList postType="article" />} />
            {/* Testimonials */}
            <Route path="testimonials/video" element={<UploadVideoTestimonial />} />
            <Route path="testimonials/video-list" element={<TestimonialListPage />} />
            <Route path="testimonials/written" element={<WrittenTestimonials />} />
            <Route path="testimonials/written-list" element={<WrittenTestimonialList />} />

            {/* Itineraries */}
            <Route path="itineraries" element={<Navigate to="/itineraries/list" replace />} />
            <Route path="itineraries/create" element={<CreateItineriesPage />} />
            <Route path="itineraries/list" element={<ItineraryListPage />} />
            <Route path="itineraries/edit/:id" element={<CreateItineriesPage />} />
            <Route path="itineraries/view/:id" element={<CreateItineriesPage />} />
            <Route path="itineraries/reviews" element={<ItineraryReviewApprovals />} />

            {/* Global Terms */}
            <Route path="global-terms" element={<GlobalTerms />} />
            {/* User Agreement */}
            <Route path="user-agreement" element={<UserAgreementAdmin />} />
            {/* Cancellation Policy */}
            <Route path="cancellation-policy" element={<HoneymoonCancellationPolicy />} />
            {/* Payment Mode Terms */}
            <Route path="payment-mode-terms" element={<HoneymoonPaymentMode />} />
            {/* Terms and Conditions */}
            <Route path="terms-and-conditions" element={<HoneymoonTermsAndCondition />} />
            { /* Plan Your Journey Leads */}
            <Route path="leads/plan-journey" element={<PlanYourJourney />} />
            <Route path="leads/honeymoon-requests" element={<HoneymoonTripRequests />} />
            <Route path="leads/contacts" element={<ContactUs />} />
            <Route path="leads/consultation" element={<ConsultationLeads />} />
            <Route path="leads/suggestions" element={<Suggestions />} />
            <Route path="leads/subscribe" element={<Subscribe />} />
            <Route path="leads/itinerary-leads" element={<ItineraryLeads />} />

            {/* Gift Cards */}
            <Route path="giftcards/verify" element={<VerifyGiftCard />} />
            <Route path="giftcards/bulk" element={<BulkGiftCard />} />

            {/* Bookings */}
            <Route path="bookings" element={<BookedPackages />} />

            {/* Social Management */}
            <Route path="social-management" element={<SocialManagement />} />

            {/* Marketing — Email Templates & Campaigns */}
            <Route path="email-templates" element={<EmailTemplates />} />
            <Route path="email-campaigns" element={<CampaignManagement />} />

            {/* Registered Customers */}
            <Route path="customers" element={<CustomersList />} />
            <Route path="customers/:id" element={<CustomerDetails />} />

            {/* Reports & Settings */}
            <Route path="about-settings" element={<AboutSettings />} />
            <Route path="reports" element={<Reports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings/notifications" element={<NotificationRecipients />} />
            <Route path="settings/referral" element={<ReferralSettings />} />
            <Route path="settings/gst" element={<GstSettings />} />
            <Route path="settings/stats" element={<HomeStatsSettings />} />
            <Route path="settings/chatbot" element={<ChatbotSettings />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  )
}

export default App
