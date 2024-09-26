import React, { useState } from "react";
import Post from "./Post";
import { useDispatch, useSelector } from "react-redux";
import { Input } from "./ui/input";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setOpenSearch } from "@/redux/authSlice";
import { Link } from "react-router-dom";

const Posts = () => {
  const { posts } = useSelector((store) => store.post);
  const { openSearch, suggestedUsers } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  let filteredUsers = [];
  if (searchQuery !== "") {
    const filtered = suggestedUsers?.filter((suggestedUser) =>
      suggestedUser.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    filteredUsers = filtered;
  }

  return (
    <>
      <Dialog open={openSearch} className="z-10">
        <DialogTitle className="hidden"></DialogTitle>

        <DialogContent
          onInteractOutside={() => {
            dispatch(setOpenSearch(false)), setSearchQuery("");
          }}
          className=" sm:w-1/3"
        >
          <Input
            className="w-full"
            name="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter username"
          />

          <div className="p-1">
            {filteredUsers.length == 0 && searchQuery !== "" ? (
              <div className="text-center py-3">
                No user found with this username
              </div>
            ) : (
              filteredUsers.map((item) => {
                return (
                  <Link to={`/profile/${item._id}`}>
                    <div
                      key={item._id}
                      className="flex p-1 items-center gap-5 hover:bg-gray-100 transition-all"
                    >
                      <Avatar className="size-10">
                        <AvatarImage
                          src={item?.profilePicture}
                          alt="post_image"
                        />
                        <AvatarFallback>
                          {item?.username?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <h1 className="text-base">
                          {item.username.charAt(0).toUpperCase() +
                            item.username.slice(1).toLowerCase()}
                        </h1>
                        <div className="flex items-center gap-3 text-xs">
                          <p>@{item.username}</p>
                          <li>{item.followers.length} followers</li>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
      <div className="z-0">
        {posts.map((post) => {
          return <Post key={post._id} post={post} />;
        })}
      </div>
    </>
  );
};

export default Posts;
