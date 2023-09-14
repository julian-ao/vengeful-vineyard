import { useAuth } from "react-oidc-context";
import { Footer } from "../../components/footer";
import { Nav } from "../../components/nav";
import axios from "axios";
import { Outlet } from "react-router-dom";
import { Spinner } from "../../components/spinner";
import { Notification } from "../../components/notification";
import { useState } from "react";
import { NotificationContext } from "../../helpers/notificationContext";

export const Layout = () => {
  const auth = useAuth();
  const [notification, setNotification] = useState({
    show: false,
    title: "",
    text: "",
  });

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return (
      <main className="flex h-screen flex-col justify-between">
        <Nav auth={auth} />
        <div className="flex items-center justify-center">
          <Spinner />
        </div>
        <Footer />
      </main>
    );
  }

  if (auth.error) {
    return (
      <main className="flex h-screen flex-col justify-between">
        <Nav auth={auth} />
        <div className="flex items-center justify-center">
          <h1>Ai ai ai ai ai!!!</h1>
        </div>
        <Footer />
      </main>
    );
  }

  if (auth.isAuthenticated) {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${auth.user?.access_token}`;
  }

  return (
    <main className="flex h-screen flex-col justify-between">
      <NotificationContext.Provider value={{ notification, setNotification }}>
        <Nav auth={auth} />
        <div className="mb-auto">
          <Outlet />
        </div>
        <Footer />
        <Notification />
      </NotificationContext.Provider>
    </main>
  );
};