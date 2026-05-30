import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import QrConnect from "./pages/WhatsApp/QrConnect";
import SendMessage from "./pages/WhatsApp/SendMessage";
import Contacts from "./pages/WhatsApp/Contacts";
import Groups from "./pages/WhatsApp/Groups";
import Accounts from "./pages/WhatsApp/Accounts";
import MyContacts from "./pages/WhatsApp/MyContacts";
import Segments from "./pages/Audience/Segments";
import Blacklist from "./pages/Audience/Blacklist";
import Templates from "./pages/Messaging/Templates";
import Campaigns from "./pages/Messaging/Campaigns";
import Scheduled from "./pages/Messaging/Scheduled";

// Catatan: halaman demo template lama (Calendar, Profile, Forms, Tables,
// UI Elements, Charts, Blank) dipindah ke src/_reference sebagai contoh.
// Untuk mengaktifkan kembali, import dari "./_reference/..." dan daftarkan route-nya.

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout (protected) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />

              {/* WhatsApp Accounts */}
              <Route path="/wa/accounts" element={<Accounts />} />
              <Route path="/wa/scan-qr" element={<QrConnect />} />

              {/* Audience */}
              <Route path="/wa/my-contacts" element={<MyContacts />} />
              <Route path="/segments" element={<Segments />} />
              <Route path="/blacklist" element={<Blacklist />} />
              <Route path="/wa/contacts" element={<Contacts />} />
              <Route path="/wa/groups" element={<Groups />} />

              {/* Messaging */}
              <Route path="/templates" element={<Templates />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/scheduled" element={<Scheduled />} />
              <Route path="/wa/send-message" element={<SendMessage />} />
            </Route>
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
