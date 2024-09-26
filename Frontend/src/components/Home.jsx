import React, { useEffect } from "react";
import Feed from "./Feed";
import { Outlet } from "react-router-dom";
import RightSidebar from "./RightSidebar";
import useGetAllPost from "@/hooks/useGetAllPost.js";
import useGetSuggestedUsers from "@/hooks/useGetSuggestedUsers";
import { useDispatch } from "react-redux";
import { setSelectedUser } from "@/redux/authSlice";

const Home = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setSelectedUser(null));
  }, []);

  useGetAllPost();
  useGetSuggestedUsers();
  return (
    <div className="flex">
      <div className="flex-grow">
        <Feed />
        <Outlet />
      </div>
      <RightSidebar />
    </div>
  );
};

export default Home;
