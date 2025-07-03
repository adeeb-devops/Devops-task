import React, { Suspense, lazy, ReactNode} from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Loader from "../Master-Office/Components/Loader";
const MasterLogin = lazy(() => import("../Master-Office/Components/Login/MasterLogin"));
const BackLogin = lazy(() => import("../Back-Office/Components/Login/BackLogin"));

const MasterOfficeRoutes = lazy(() => import("./MasterOfficeRoutes"));
const BackOfficeRoutes = lazy(() => import("./BackOfficeRoutes"));

interface PrivateRouteProps {
	children: ReactNode;
}
const MasterPrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
	// const masterToken = true;
	const masterToken = sessionStorage.getItem("masterToken");
	return masterToken ? children : <Navigate to="/master-office" replace />;
};

const BackPrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
	// const backToken = true;
	const backToken = sessionStorage.getItem("clientToken");
	return backToken ? children : <Navigate to="/back-office" replace />;
};
const SuspenseWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
	<Suspense fallback={<Loader />}>{children}</Suspense>
  );

const AdminRoutes = () => (
  <SuspenseWrapper>
    <Routes>
      {/* <Route path="/master-office" element={<MasterLogin />} /> */}
      <Route path="/master-office" element={<MasterLogin />} />
      <Route
        path="/master-office/*"
        element={
          <MasterPrivateRoute>
            <SuspenseWrapper>
              <MasterOfficeRoutes />
            </SuspenseWrapper>
          </MasterPrivateRoute>
        }
      />
      <Route path="/back-office" element={<BackLogin />} />
      <Route
        path="/back-office/*"
        element={
          <BackPrivateRoute>
            <SuspenseWrapper>
              <BackOfficeRoutes />
            </SuspenseWrapper>
          </BackPrivateRoute>
        }
      />
    </Routes>
  </SuspenseWrapper>
);

export default AdminRoutes;
