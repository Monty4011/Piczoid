import React from "react";
import Posts from "./Posts";

const Feed = () => {
  return (
    <>
      <div className="flex-1 my-8 flex flex-col items-center px-5 md:pl-[20%] lg:pl-[30%]">
        <Posts />
      </div>
    </>
  );
};

export default Feed;
