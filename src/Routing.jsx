import React, {
  Suspense,
  lazy,
  useState,
  useEffect,
  memo,
  useContext,
} from "react";
import PropTypes from "prop-types";
const IMAGE_BASE_URL = import.meta.env.VITE_BASE_IMAGE_URL;
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { CategoryContext, CategoryProvider } from "./context/CategoryContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { OrdersProvider } from "./context/OrdersContext";
import { MessagingProvider } from "./context/MessagingContext";
import { PackageProvider } from "./context/PackageContext";
import {
  LocationPriceProvider,
  useLocationPrice,
} from "./context/LocationPriceContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ToastManager from "./components/ToastManager";
import Loading from "./components/Loading/loading";
const loadingGif =  `${IMAGE_BASE_URL}/loading.gif`; 
import ProtectedRoute from "./ProtectedRoute";
import { HelpProvider } from "./context/HelpContext";
import Blogs from "./components/Blogs/Blogs";
import Blogview from "./components/Blogs/Blogview";
import Privacypolicy from "./components/Footer/privacypolicy";
import LZString from "lz-string";
import FaqChat from "./components/Chat/FaqChat";
import NoInternet from "./pages/NoInternet";
import CouponViewPage from "./pages/USER-PROFILE/COUPONS/couponviewpage";
// Lazy load components
import ScrollToTop from "./components/Scrooltop";
import Termsconditioins from "./components/Footer/Terms-conditioins";
import Contactus from "./components/Contactus/contactus";
import Careers from "./components/Careers/careers";
import Profile from "./pages/USER-PROFILE/Profile";
import SubscribeProvider from "./context/Subscribe";
import { OrderHistoryProvider } from "./context/OrderHistoryContext";
import Allcategories from "./pages/Home/Allcategories/Allcategories";
import Servicesearch from "./components/Header/Searvicesearch";
import MyLocation from "./components/Header/MyLocation";
import Notserving from "./components/Not-serving/notserving";

// params
function ServicesWrapper() {
  const currentUrl = new URL(window.location.href);

  // Retrieve values from sessionStorage
  const cleaning = sessionStorage.getItem("catname"); // Category name
  const subCategory = sessionStorage.getItem("subcatname"); // Subcategory name
  const location = sessionStorage.getItem("selectedCity"); // Location

  // Set the URL search parameters
  if (cleaning) currentUrl.searchParams.set("category", cleaning);
  if (subCategory) currentUrl.searchParams.set("subcategory", subCategory);
  if (location) currentUrl.searchParams.set("location", location);

  // Update the URL without reloading the page
  window.history.pushState({}, "", currentUrl);

  return <Services />;
}


//lazyloading components.
const YourOrderPage = memo(
  lazy(() => import("./pages/YourOrderPage/YourOrderPage")),
); // Adjust the path based on your project structure
const NotificationsPage = memo(
  lazy(() => import("./pages/USER-PROFILE/NotificationsPage")),
);

const HomeWrapper = memo(lazy(() => import("./components/Home/HomeWrapper")));
const Services = memo(lazy(() => import("./pages/SERVICES/Services")));
const OrderTracking = memo(
  lazy(() => import("./pages/OrderTracking/OrderTracking")),
);
const RegisterAsProfessional = memo(
  lazy(() => import("./components/Header/RegisterAsProfessional")),
);
const Aboutus = memo(lazy(() => import("./components/Aboutus/aboutus")));
const WorkerComponent = memo(lazy(() => import("./pages/WorkerComponent")));
const Userprofile = memo(
  lazy(() => import("./pages/USER-PROFILE/user-profile")),
);
const Addresses = memo(
  lazy(() => import("./pages/USER-PROFILE/ADDRESSES/addresses")),
);
const Bookings = memo(
  lazy(() => import("./pages/USER-PROFILE/BOOKINGS/Bookings")),
);
const BookingDetails = memo(
  lazy(() => import("./pages/USER-PROFILE/BOOKINGS/BookingDetails")),
);
const Wallet = memo(lazy(() => import("./pages/USER-PROFILE/WALLET/wallet")));
const Invite = memo(
  lazy(() => import("./pages/USER-PROFILE/INVITEAFRIEND/invite")),
);
const Coupons = memo(
  lazy(() => import("./pages/USER-PROFILE/COUPONS/coupons")),
);
const Rewards = memo(
  lazy(() => import("./pages/USER-PROFILE/MY-REWARDS/rewards")),
);
const CartPage = memo(lazy(() => import("./pages/CartPage")));
const Packages = memo(
  lazy(() => import("./pages/USER-PROFILE/PACKAGES/Packages")),
);
const Header = memo(lazy(() => import("./components/Header/header")));
const Footer = memo(lazy(() => import("./components/Footer/footer")));
const HelpPage = memo(lazy(() => import("./pages/Help/HelpPage")));
const ReferralCard = memo(
  lazy(() => import("./pages/USER-PROFILE/REFERRAL-PAGE/ReferralCard")),
);

const HeaderComponent = ({
  selectedDistrict,
  mobileAddress,
  mobileFullAddress,
}) => {
  const location = useLocation();

  if (!["/mylocation", "/servicesearch"].includes(location.pathname)) {
    return (
      <Header
        selectedDistrict={selectedDistrict}
        mobileAddress={mobileAddress}
        mobileFullAddress={mobileFullAddress}
      />
    );
  }
  return null;
};

HeaderComponent.propTypes = {
  selectedDistrict: PropTypes.string,
  mobileAddress: PropTypes.string,
  mobileFullAddress: PropTypes.string,
};

const FooterComponent = () => {
  const location = useLocation();

  if (!["/mylocation", "/servicesearch"].includes(location.pathname)) {
    return <Footer shouldHideFooter={false} />;
  }
  return null;
};

const Routing = () => {
  const { initialFetchComplete } = useLocationPrice();
  const [loadingVisible, setLoadingVisible] = useState(() => {
    const hasLoaded = sessionStorage.getItem("hasHomeLoaded") === "true";
    return !hasLoaded;
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [mobileAddress, setMobileAddress] = useState("");
  const [mobileFullAddress, setMobileFullAddress] = useState("");

  useEffect(() => {
    const storedAddress = LZString.decompress(
      sessionStorage.getItem("mobileAddress"),
    );
    if (storedAddress) {
      setMobileFullAddress(storedAddress);
      sessionStorage.setItem("selectedCity", storedAddress);
    }
  }, []);

  useEffect(() => {
    console.log(initialFetchComplete, "ghjk");
  }, [initialFetchComplete]);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("hasHomeLoaded") === "true";

    if (!hasLoaded) {
      sessionStorage.setItem("hasHomeLoaded", "true");
      setTimeout(() => {
        setLoadingVisible(false);
      }, 500);
    } else if (hasLoaded) {
      setLoadingVisible(false);
    }
  }, [initialFetchComplete]);

  const handleLocationSelect = ({ address, cityName, mobileFullAddress }) => {
    sessionStorage.setItem("selectedCity", cityName || address);
    setSelectedDistrict(cityName);
    setMobileAddress(address);
    setMobileFullAddress(mobileFullAddress);
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOffline) {
    return <NoInternet />;
  }

  return (
    <ToastManager>
      <LocationPriceProvider>
        <AuthProvider>
          <PackageProvider>
            <CartProvider>
              <CategoryProvider>
                <MessagingProvider>
                  <OrdersProvider>
                    <OrderHistoryProvider>
                      <HelpProvider>
                        <SubscribeProvider>
                          <Router>
                            <ScrollToTop />
                            {loadingVisible && (
                              <Loading message="Loading, please wait..." />
                            )}

                            {!loadingVisible && (
                              <Suspense
                                fallback={
                                  <div className="loading-gif">
                                    <img src={loadingGif} alt="loading" />
                                  </div>
                                }
                              >
                                <HeaderComponent
                                  selectedDistrict={selectedDistrict}
                                  mobileAddress={mobileAddress}
                                  mobileFullAddress={mobileFullAddress}
                                />

                                <Routes>
                                  <Route path="/" element={<HomeWrapper />} />

                                  <Route
                                    path="/notifications"
                                    element={<NotificationsPage />}
                                  />

                                  <Route
                                    path="/services"
                                    element={<ServicesWrapper />}
                                  />
                                  <Route path="/blogs" element={<Blogs />} />
                                  <Route
                                    path="/blogview"
                                    element={<Blogview />}
                                  />
                                  <Route
                                    path="/privacypolicy"
                                    element={<Privacypolicy />}
                                  />
                                  <Route
                                    path="/register-as-a-professional"
                                    element={<RegisterAsProfessional />}
                                  />
                                  <Route
                                    path="/terms"
                                    element={<Termsconditioins />}
                                  />
                                  <Route
                                    path="/help-homepage"
                                    element={<HelpPage />}
                                  />
                                  <Route
                                    path="/contact"
                                    element={<Contactus />}
                                  />
                                  <Route
                                    path="/careers"
                                    element={<Careers />}
                                  />
                                  <Route
                                    path="/ordertracking"
                                    element={<OrderTracking />}
                                  />
                                  <Route
                                    path="/all-categories"
                                    element={<Allcategories />}
                                  />
                                  <Route
                                    path="/aboutus"
                                    element={<Aboutus />}
                                  />
                                  <Route
                                    path="/service-search"
                                    element={<Servicesearch />}
                                  />

                                  {/* Protected Routes */}
                                  <Route element={<ProtectedRoute />}>
                                    <Route
                                      path="/your-order-page"
                                      element={<YourOrderPage />}
                                    />

                                    <Route
                                      path="/referral"
                                      element={<ReferralCard />}
                                    />
                                    <Route
                                      path="/aboutus"
                                      element={<Aboutus />}
                                    />
                                    <Route
                                      path="/workers"
                                      element={<WorkerComponent />}
                                    />
                                    <Route
                                      path="/userprofile"
                                      element={<Userprofile />}
                                    />
                                    <Route
                                      path="/addresses"
                                      element={<Addresses />}
                                    />
                                    <Route
                                      path="/bookings"
                                      element={<Bookings />}
                                    />
                                    <Route
                                      path="/wallet"
                                      element={<Wallet />}
                                    />
                                    <Route
                                      path="/invite"
                                      element={<Invite />}
                                    />
                                    <Route
                                      path="/coupons"
                                      element={<Coupons />}
                                    />
                                    <Route
                                      path="/rewards"
                                      element={<Rewards />}
                                    />
                                    <Route
                                      path="/cart"
                                      element={<CartPage />}
                                    />
                                    <Route
                                      path="/packages"
                                      element={<Packages />}
                                    />
                                    <Route
                                      path="/booking-details/:id"
                                      element={<BookingDetails />}
                                    />
                                    <Route
                                      path="/profile"
                                      element={<Profile />}
                                    />
                                    <Route
                                      path="/coupon-view"
                                      element={<CouponViewPage />}
                                    />
                                  </Route>
                                  <Route
                                    path="/mylocation"
                                    element={
                                      <MyLocation
                                        onLocationSelect={handleLocationSelect}
                                      />
                                    }
                                  />

                                  <Route
                                    path="/notserving"
                                    element={<Notserving />}
                                  />

                                  <Route
                                    path="*"
                                    element={<Navigate to="/" />}
                                  />
                                  <Route
                                    path="/faqChat"
                                    element={<FaqChat />}
                                  />
                                </Routes>

                                <FooterComponent />
                                {/* <Mobilefooter /> */}
                              </Suspense>
                            )}
                          </Router>
                        </SubscribeProvider>
                      </HelpProvider>
                    </OrderHistoryProvider>
                  </OrdersProvider>
                </MessagingProvider>
              </CategoryProvider>
            </CartProvider>
          </PackageProvider>
        </AuthProvider>
      </LocationPriceProvider>
    </ToastManager>
  );
};

export default Routing;
