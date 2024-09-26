import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
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

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { likeNotification } = useSelector(
    (store) => store.realTimeNotification
  );
  const { messageNotification } = useSelector(
    (store) => store.messageNotification
  );

  const totalNotifications =
    likeNotification?.length + messageNotification?.length;
  const allNotifications = [...likeNotification, ...messageNotification];

  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="w-6 h-6">
          <AvatarImage src={user?.profilePicture} alt="profile picture" />
          <AvatarFallback>
            {user?.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];

  const logoutHandler = async () => {
    try {
      const res = await axios.get("https://piczoid.onrender.com/api/v1/user/logout", {
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
    navigate("/");
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
    <div className="fixed top-0 z-10 left-0 border-r border-gray-300  h-screen sm:p-5">
      <div className="flex flex-col">
        <div className="flex items-center px-2 pt-4 gap-1">
          <Link to="/">
            <img src="/logo.svg" alt="logo" className="w-10 cursor-pointer" />
          </Link>
          <Link to="/">
            <h1 className="font-bold text-xl cursor-pointer hidden lg:inline">
              Piczoid
            </h1>
          </Link>
        </div>
        <div>
          {sidebarItems.map((item, index) => {
            return (
              <div
                key={index}
                onClick={() => sidebarHandler(item.text)}
                className="flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3 w-fit"
              >
                {item.icon}
                <span className="hidden lg:inline">{item.text}</span>
                {item.text === "Notifications" &&
                  allNotifications.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6"
                        >
                          {totalNotifications}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div>
                          {allNotifications === 0 ? (
                            <p>No new notification</p>
                          ) : (
                            allNotifications.map((notification) => {
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
                                    {notification.type === "like"
                                      ? "liked your post"
                                      : "sent you a message"}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                {/* {item.text === "Notifications" &&
                  messageNotification?.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6"
                        >
                          {messageNotification.length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div>
                          {messageNotification.length === 0 ? (
                            <p>No new notification</p>
                          ) : (
                            messageNotification.map((notification) => {
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
                  )} */}
              </div>
            );
          })}
        </div>
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;
