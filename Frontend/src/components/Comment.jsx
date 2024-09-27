import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Comment = ({ comment }) => {
  const getDaysAgo = (createdAt) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate - createdDate; // Time difference in milliseconds
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert to days

    return daysDifference;
  };
  return (
    <div className="my-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <Avatar className="size-7 cursor-pointer">
            <AvatarImage src={comment?.author?.profilePicture} />
            <AvatarFallback>
              {comment?.author?.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h1 className="font-bold text-sm cursor-pointer">
            {comment?.author?.username}{" "}
            <span className="font-normal pl-1">{comment?.text}</span>
          </h1>
        </div>
        <div className="text-xs cursor-pointer">
          {<p>{getDaysAgo(comment?.createdAt)}d</p>}
        </div>
      </div>
    </div>
  );
};

export default Comment;
