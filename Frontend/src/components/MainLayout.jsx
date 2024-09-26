import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import { useLocation } from "react-router-dom";
import TopBar from "./TopBar";

const MainLayout = () => {
  const location = useLocation();
  return (
    <>
      <div className="hidden sm:block">
        <LeftSidebar />
      </div>
      <div className="sm:hidden">
        <TopBar />
      </div>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
