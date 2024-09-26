import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const SuggestedUsers = () => {
  const { suggestedUsers } = useSelector((store) => store.auth);

  return (
    <div className="my-10">
      <div className="flex items-center justify-between text-sm">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>
        <span className="font-medium cursor-pointer">See All</span>
      </div>
      {suggestedUsers?.map((users) => {
        return (
          <div
            key={users._id}
            className="flex items-center justify-between my-5 gap-2"
          >
            <div className="flex items-center gap-2">
              <Link to={`/profile/${users?._id}`}>
                <Avatar>
                  <AvatarImage
                    src={users?.profilePicture}
                    alt="profilePicture"
                  />
                  <AvatarFallback>
                    {users.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${users?._id}`}>
                    {users?.username.charAt(0).toUpperCase() +
                      users?.username.slice(1).toLowerCase()}
                  </Link>
                </h1>
                <span className="text-gray-600 text-sm">{users?.bio}</span>
              </div>
            </div>
            <Link to={`/profile/${users?._id}`}>
              <span className="text-[#3BADF8] text-xs font-bold cursor-pointer hover:text-[#3495d6]">
                View Profile
              </span>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedUsers;
