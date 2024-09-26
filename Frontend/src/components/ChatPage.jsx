import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import axios from "axios";
import { setSelectedUser } from "@/redux/authSlice";
import Messages from "./Messages";
import { toast } from "sonner";
import { setMessages } from "@/redux/chatSlice";
import { useLocation } from "react-router-dom";

const ChatPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  const [textMessage, setTextMessage] = useState("");

  const sendMessageHandler = async (receiverId) => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/message/send/${receiverId}`,
        { textMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));
        setTextMessage("");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const exitChatHandler = () => {
    dispatch(setSelectedUser(null));
  };

  return (
    <div className="flex h-[88vh] overflow-y-hidden sm:ml-[16%] sm:h-screen">
      <section className="w-fit md:w-1/4 my-2 sm:my-8">
        <div className="flex flex-col sm:flex-row items-center mb-2 sm:mb-4 ">
          <h1 className=" font-bold px-1 text-base sm:px-3 sm:text-xl">
            {user.username.charAt(0).toUpperCase() +
              user.username.slice(1).toLowerCase()}
          </h1>
          <p className={`text-xs font-bold text-green-600`}>online</p>
        </div>
        <hr className="mb-2 sm:mb-4 border-gray-300" />
        <div className="overflow-y-auto h-[80vh]">
          {suggestedUsers.map((suggestedUser) => {
            const isOnline = onlineUsers.includes(suggestedUser._id);
            return (
              <div
                key={suggestedUser._id}
                onClick={() => dispatch(setSelectedUser(suggestedUser))}
                className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <Avatar className="size-7 sm:size-12">
                  <AvatarImage src={suggestedUser?.profilePicture} />
                  <AvatarFallback>
                    {suggestedUser.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {suggestedUser.username.charAt(0).toUpperCase() +
                      suggestedUser.username.slice(1).toLowerCase()}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      isOnline ? "text-green-600" : "text-red-600"
                    } `}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selectedUser ? (
        <section className="flex-1 border-l border-l-gray-300 flex flex-col h-full">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-300 sticky top-0 bg-white z-10">
            <div className="flex gap-3 items-center">
              <Avatar className="size-8 sm:size-14">
                <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
                <AvatarFallback>
                  {selectedUser.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>
                  {selectedUser.username.charAt(0).toUpperCase() +
                    selectedUser.username.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={exitChatHandler} className="">
              Exit Chat
            </Button>
          </div>
          <Messages selectedUser={selectedUser} />
          <div className="flex items-center p-4 border-t border-t-gray-300 mt-2">
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className="flex-1 mr-2 focus-visible:ring-transparent"
              placeholder="Messages..."
            />
            <Button onClick={() => sendMessageHandler(selectedUser?._id)}>
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto">
          <MessageCircleCode className="size-14 sm:w-32 sm:h-32 my-4" />
          <h1 className="font-medium">Your messages</h1>
          <span>Send a message to start a chat.</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
