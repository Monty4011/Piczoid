import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser, setOpenSearch } from "@/redux/authSlice.js";
import CreatePost from "./CreatePost";
import { setPosts, setSelectedPost } from "@/redux/postSlice";

const TopBar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );

  const sidebarItems = [
    // { icon: <Home className="size-5" />, text: "Home" },
    { icon: <Search className="size-5" />, text: "Search" },
    { icon: <MessageCircle className="size-5" />, text: "Messages" },
    { icon: <Heart className="size-5" />, text: "Notifications" },
    { icon: <PlusSquare className="size-5" />, text: "Create" },
    {
      icon: (
        <Avatar className="w-5 h-5">
          <AvatarImage src={user?.profilePicture} alt="profile picture" />
          <AvatarFallback>
            {user?.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut className="size-5" />, text: "Logout" },
  ];

  const logoutHandler = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const createPostHandler = () => {
    setOpen(true);
  };

  const profileHandler = () => {
    navigate(`/profile/${user._id}`);
  };

  const homeHandler = () => {
    navigate(`/`);
  };

  const messagesHandler = () => {
    navigate(`/chat`);
  };

  const searchHandler = () => {
    navigate("/")
    dispatch(setOpenSearch(true));
  };

  const sidebarHandler = (textType) => {
    if (textType === "Logout") {
      logoutHandler();
    } else if (textType === "Create") {
      createPostHandler();
    } else if (textType === "Profile") {
      profileHandler();
    } else if (textType === "Home") {
      homeHandler();
    } else if (textType === "Messages") {
      messagesHandler();
    } else if (textType === "Search") {
      searchHandler();
    }
  };

  return (
    <div className="relative top-0 z-10 flex flex-col border-b border-gray-300">
      <div className="flex items-center justify-around">
        <Link to="/">
          <img
            src="/logo.svg"
            alt="logo"
            className="w-10 cursor-pointer size-7"
          />
        </Link>
        <div className="flex items-center">
          {sidebarItems.map((item, index) => {
            return (
              <div
                key={index}
                onClick={() => sidebarHandler(item.text)}
                className="flex items-center relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3 w-fit"
              >
                {item.icon}
                {item.text === "Notifications" &&
                  likeNotification.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6"
                        >
                          {likeNotification.length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div>
                          {likeNotification.length === 0 ? (
                            <p>No new notification</p>
                          ) : (
                            likeNotification.map((notification) => {
                              return (
                                <div
                                  key={notification.userId}
                                  className="flex items-center gap-2 my-2"
                                >
                                  <Avatar>
                                    <AvatarImage
                                      src={
                                        notification.userDetails?.profilePicture
                                      }
                                    />
                                    <AvatarFallback>
                                      {notification.userDetails?.username
                                        ?.slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="text-sm">
                                    <span className="font-bold">
                                      {notification.userDetails?.username
                                        .charAt(0)
                                        .toUpperCase() +
                                        notification.userDetails?.username
                                          .slice(1)
                                          .toLowerCase()}
                                    </span>{" "}
                                    liked your post
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
              </div>
            );
          })}
        </div>
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default TopBar;
