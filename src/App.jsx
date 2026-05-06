
// import { createBrowserRouter, RouterProvider } from "react-router-dom"
// import { useEffect } from "react"

// // Layout
// import AdminLayout from "./layouts/AdminLayout"

// // Pages
// import Login from "./pages/auth/Login"
// import Dashboard from "./pages/dashboard/Dashboard"
// import HoneymoonHeroVideo from "./routes/hero_video/page" // ✅ ADD THIS
// import AddUser from "./pages/users/AddUser"

// import UserList from "./pages/users/UsersList"
// import CreateDestination from "./pages/destinations/CreateDestination"
// import CreateCity from "./pages/destinations/CreateCity"
// import HoneymoonGallery from "./pages/customer-gallery/HoneymoonGallery"
// import HoneymoonResortForm from "./pages/resorts/CreateResort" 
// import HoneymoonResortList from "./pages/resorts/ResortList" 
// import EditPage from "./pages/resorts/EditPage"
// // Protected Route
// import ProtectedRoutes from "./components/ProtectedRoutes"

// // Store
// import useAuthStore from "./stores/authStores"

// function App() {
//   const checkAuthOnLoad = useAuthStore((s) => s.checkAuthOnLoad)

//   useEffect(() => {
//     checkAuthOnLoad()
//   }, [checkAuthOnLoad])

//   const router = createBrowserRouter([
//     {
//       path: "/login",
//       element: <Login />,
//     },
//     {
//       element: <ProtectedRoutes />,
//       children: [
//         {
//           path: "/",
//           element: <AdminLayout />,
//           children: [
//             { index: true, element: <Dashboard /> },          
//             { path: "users/add", element: <AddUser /> }, 
//             { path: "users/list", element: <UserList /> },
//             { path: "destinations/city", element: <CreateCity /> },
//             { path: "destinations/create", element: <CreateDestination /> },
//             {path: "gallery/images", element: <HoneymoonGallery />},
//             { path: "resorts/create", element: <HoneymoonResortForm /> },
//             { path: "resorts/list", element: <HoneymoonResortList /> }, 
//             { path: "resorts/edit/:id", element: <EditPage /> },
        
//             // ✅ ADD THIS ROUTE

//             { path: "hero-video", element: <HoneymoonHeroVideo /> },
//           ],
//         },
//       ],
//     },
//   ])

//   return <RouterProvider router={router} />
// }

// export default App


import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
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
// Iteraries
 import CreateItineriesPage from "./pages/itineraries/CreateItinerary"  
 import ItineraryListPage from "./pages/Itinerary_list/ItineraryList" 

// Blogs
 import CreateBlog from "./pages/blog/CreateBlog"
import BlogList from "./pages/blog/BlogsList"
// Honeymoon Resorts
 import HoneymoonResortForm from "./pages/resorts/CreateResort" 
 import HoneymoonResortList from "./pages/resorts/ResortList" 
 import EditPage from "./pages/resorts/EditPage"
import TestimonialListPage from "./pages/testimonials/TestimonialLists"
// Protected Route
import ProtectedRoutes from "./components/ProtectedRoutes"

import HoneymoonCancellationPolicy from "./pages/cancellation-policy/page"
import HoneymoonPaymentMode from "./pages/payment-mode/page"
import HoneymoonTermsAndCondition from "./pages/terms-and-conditions/page"
import Reports from "./pages/reports/Reports"
import Settings from "./pages/settings/Settings"
import AuditLogs from "./pages/audit/AuditLogs"

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
      <Routes>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<AdminLayout />}>

            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Users */}
            <Route path="users/add" element={<AddUser />} />
            <Route path="users/list" element={<UserList />} />

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

            {/* Hero Section Management */}
            <Route path="hero-content" element={<HeroContent />} />
            <Route path="hero-media" element={<HeroMedia />} />

            {/* Blog (when ready) */}
            <Route path="blogs/create" element={<CreateBlog />} />
            <Route path="blogs/edit/:id" element={<CreateBlog />} />
            <Route path="blogs/list" element={<BlogList />} />

            {/* Video Testimonials */}
            <Route path="testimonials/video" element={<UploadVideoTestimonial />} />
            <Route path="testimonials/list" element={<TestimonialListPage />} />

            {/* Itineraries */}
            <Route path="itineraries/create" element={<CreateItineriesPage />} />
            <Route path="itineraries/list" element={<ItineraryListPage />} />
            <Route path="itineraries/edit/:id" element={<CreateItineriesPage />} />
            
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

            {/* Reports & Settings */}
            <Route path="reports" element={<Reports />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  )
}

export default App
