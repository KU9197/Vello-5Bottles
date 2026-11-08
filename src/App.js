import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Thankyoupage from "./pages/Thankyoupage";
import SingleProduct from "./pages/SingleProduct";
import ErrorPage from "./pages/ErrorPage";
import { ThemeProvider } from "styled-components";
import MoreinfoPositive from "./Components/moreinfoPositive";
import MoreinfoNegative from "./Components/moreinfoNegative";
import Login from "./pages/login";
import ReactGA from "react-ga4";
import Model3D from "./Components/Model3D";
import { CookiesProvider } from "react-cookie";
import ThreeDViewerPage from "./pages/ThreeDviewer";

const TRACKING_ID = "G-G7L7Q28LTL";
ReactGA.initialize(TRACKING_ID);

const DynamicMoreinfo = ({ userId }) => {
  const urlParams = new URLSearchParams(window.location.search);
  const version = urlParams.get("isV");
  return version === "true" ? <MoreinfoPositive userId={userId ?? urlParams.get("userId") ?? ""} /> : <MoreinfoNegative userId={userId ?? urlParams.get("userId") ?? ""} />;
};

const AppRoutes = () => {
  const [userId, setUserId] = useState(() => {
    const saved = sessionStorage.getItem("currentUserId");
    if (saved) return saved;
    return new URLSearchParams(window.location.search).get("userId") ?? undefined;
  });
  const location = useLocation();

  useEffect(() => {
    const searchUserId = new URLSearchParams(location.search).get("userId");
    if (searchUserId) {
      setUserId(searchUserId);
      sessionStorage.setItem("currentUserId", searchUserId);
    }
  }, [location.search]);

  const handleLogin = (id) => {
    setUserId(id);
    sessionStorage.setItem("currentUserId", id);
  };

  const ref = useRef(null);

  const theme = {
    colors: {
      heading: "rgb(24 24 29)",
      text: "rgba(29 ,29, 29, .8)",
      white: "#fff",
      black: " #212529",
      helper: "#8490ff",
      bg: "#F6F8FA",
      footer_bg: "#0a1435",
      btn: "rgb(98 84 243)",
      border: "rgba(98, 84, 243, 0.5)",
      hr: "#ffffff",
      gradient: "linear-gradient(0deg, rgb(132 144 255) 0%, rgb(98 189 252) 100%)",
      shadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;",
      shadowSupport: " rgba(0, 0, 0, 0.16) 0px 1px 4px",
    },
    media: {
      mobile: "768px",
      tab: "998px",
    },
  };

  return (
    <CookiesProvider defaultSetOptions={{ path: "/" }}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Login handleLogin={handleLogin} />} />
          <Route path="/home" element={<Home userId={userId ?? ""} ref={ref} />} />
          <Route path="/thankyou" element={<Thankyoupage />} />
          <Route path="/3dmodel" element={<Model3D product={1} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/product" element={<SingleProduct />} />
          <Route path="/3dviewer" element={<ThreeDViewerPage />} />
          <Route path="/product/moreinfo" element={<DynamicMoreinfo userId={userId ?? ""} />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </ThemeProvider>
    </CookiesProvider>
  );
};

const App = () => {
  ReactGA.send({
    hitType: "pageview",
    page: window.location.href,
    title: "Appp",
  });

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
