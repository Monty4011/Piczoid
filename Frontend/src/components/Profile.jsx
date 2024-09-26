import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  setAuthUser,
  setSelectedUser,
  setUserProfile,
} from "@/redux/authSlice";
import { setPosts, setSelectedPost } from "@/redux/postSlice";

const Profile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const userId = params.id;
  const dispatch = useDispatch();
  useGetUserProfile(userId);
  const { userProfile, user } = useSelector((store) => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const [isFollowing, setIsFollowing] = useState(
    userProfile?.followers.includes(user?._id)
  );

  const [activeTab, setActiveTab] = useState("posts");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const displayedPost =
    activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks;

  const followUnfollowHandler = async () => {
    try {
      const res = await axios.get(
        `https://piczoid.onrender.com/api/v1/user/followorunfollow/${userId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        if (res.data.type === "unfollow") {
          // Remove from followers and update userProfile
          const updatedFollowers = userProfile.followers.filter(
            (id) => id !== user?._id
          );
          const updatedFollowing = user?.following.filter((id) => id !== userId);

          dispatch(
            setUserProfile({ ...userProfile, followers: updatedFollowers })
          );
          dispatch(setAuthUser({ ...user, following: updatedFollowing }));

          setIsFollowing(false);
        } else {
          // Add to followers and update userProfile
          dispatch(
            setUserProfile({
              ...userProfile,
              followers: [...userProfile.followers, user?._id],
            })
          );
          dispatch(
            setAuthUser({
              ...user,
              following: [...user.following, userId],
            })
          );

          setIsFollowing(true);
        }
        toast(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const messageHandler = async () => {
    dispatch(setSelectedUser(userProfile));
    navigate("/chat");
  };

  const logoutHandler = async () => {
    try {
      const res = await axios.get(
        "https://piczoid.onrender.com/api/v1/user/logout",
        {
          withCredentials: true,
        }
      );
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

  return (
    <div className="flex justify-center items-center max-w-full sm:mx-auto px-10 sm:pr-5 lg:max-w-3xl md:max-w-xl">
      <div className="flex flex-col gap-10 py-5 items-center sm:p-8">
        <div className="flex flex-col items-center sm:flex-row">
          <section className="flex justify-center">
            <Avatar className="size-16 sm:size-32">
              <AvatarImage
                src={userProfile?.profilePicture}
                alt="profilephoto"
              />
              <AvatarFallback className="text-5xl font-bold">
                {userProfile.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className="flex flex-col gap-2 items-center">
              <div className=" flex flex-col items-center sm:flex-row sm:items-center gap-2 sm:pl-0">
                <span>
                  {userProfile.username.charAt(0).toUpperCase() +
                    userProfile.username.slice(1).toLowerCase()}
                </span>
                {isLoggedInUserProfile ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Link to="/account/edit">
                        <Button
                          variant="secondary"
                          className="hover:bg-gray-200 h-8"
                        >
                          Edit profile
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        className="hover:bg-gray-200 h-8"
                        onClick={logoutHandler}
                      >
                        Logout
                      </Button>
                    </div>
                  </>
                ) : userProfile.followers.length > 0 ? (
                  <>
                    <Button
                      onClick={followUnfollowHandler}
                      variant="secondary"
                      className="h-8"
                    >
                      Unfollow
                    </Button>
                    <Button
                      onClick={messageHandler}
                      variant="secondary"
                      className="h-8"
                    >
                      Message
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={followUnfollowHandler}
                    className="bg-[#0095F6] hover:bg-[#3192d2] h-8"
                  >
                    Follow
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <p>
                  <span className="font-semibold">
                    {userProfile?.posts.length}{" "}
                  </span>
                  posts
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.followers.length}{" "}
                  </span>
                  followers
                </p>
                <p>
                  <span className="font-semibold">
                    {userProfile?.following.length}{" "}
                  </span>
                  following
                </p>
              </div>
              <div className="flex flex-col gap-1 items-center sm:items-start">
                <span className="font-semibold">{userProfile?.bio}</span>
                <Badge className="w-fit" variant="secondary">
                  <AtSign className="size-4" />
                  <span className="pl-1 text-sm">{userProfile?.username}</span>
                </Badge>
                {userProfile?.taglines?.map((item, index) => {
                  return (
                    <span key={index} className="flex gap-1 items-center">
                      <SendHorizonal className="size-5" />
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-t-gray-200 ml-10 ">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("saved")}
            >
              SAVED
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {displayedPost?.map((post) => {
              return (
                <div key={post?._id} className="relative group cursor-pointer">
                  <img
                    src={post.image}
                    alt="postimage"
                    className="rounded-sm my-2 w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-1 justify-center text-white sm:space-x-4">
                      <button className="flex items-center sm:flex-row sm:gap-2 hover:text-gray-300">
                        <Heart className="size-3 sm:size-7" />
                        <span>{post?.likes?.length}</span>
                      </button>
                      <button className="flex items-center sm:flex-row sm:gap-2 hover:text-gray-300">
                        <MessageCircle className="size-3 sm:size-7" />
                        <span>{post?.comments?.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
