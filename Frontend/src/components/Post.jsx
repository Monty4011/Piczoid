import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Bookmark,
  BookmarkCheck,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import axios from "axios";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, setSelectedPost } from "@/redux/postSlice.js";
import { Link } from "react-router-dom";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";

const Post = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(
    post?.likes?.includes(user?._id) ? true : false
  );
  const [postLike, setPostLike] = useState(post.likes?.length);
  const [comment, setComment] = useState(post?.comments);
  const [loading, setLoading] = useState(false);
  const [bookmarkType, setBookmarkType] = useState("");
  const userId = post.author._id;
  const [isFollowing, setIsFollowing] = useState(
    post.author.followers.includes(user._id)
  );
  const [dopen, setDopen] = useState(false);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };

  const deletePostHandler = async () => {
    try {
      setLoading(true);
      const res = await axios.delete(
        `http://localhost:8000/api/v1/post/delete/${post._id}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedPostData = posts.filter(
          (postItem) => postItem._id !== post._id
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const likeOrDislikeHandler = async (postId) => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${postId}/${action}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        const updatedLikes = liked ? postLike - 1 : postLike + 1;
        setPostLike(updatedLikes);
        setLiked(!liked);

        const updatedPostData = posts.map((p) =>
          p._id === postId
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user?._id)
                  : [...p.likes, user?._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const commentHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${post._id}/comment`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setText("");
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const bookmarkHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post?._id}/bookmark`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setBookmarkType(res.data.type);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const followUnfollowHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/user/followorunfollow/${userId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        if (res.data.type === "unfollow") {
          // Remove from followers and update userProfile
          const updatedPosts = posts.map((p) => {
            if (p.author._id === userId) {
              return {
                ...p,
                author: {
                  ...p.author,
                  followers: p.author.followers.filter((id) => id !== user._id),
                },
              };
            }
            return p;
          });
          const updatedFollowing = user.following.filter((id) => id !== userId);

          dispatch(setPosts(updatedPosts));
          dispatch(setAuthUser({ ...user, following: updatedFollowing }));

          setIsFollowing(false);
        } else {
          // Add to followers and update userProfile
          const updatedPosts = posts.map((p) => {
            if (p.author._id === userId) {
              return {
                ...p,
                author: {
                  ...p.author,
                  followers: [...p.author.followers, user._id],
                },
              };
            }
            return p;
          });
          dispatch(setPosts(updatedPosts));
          dispatch(
            setAuthUser({
              ...user,
              following: [...user.following, userId],
            })
          );

          setIsFollowing(true);
        }
        console.log(isFollowing);
        toast(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const outsideHandler = () => {
    setDopen(false);
  };

  const openHandler = () => {
    setDopen(true);
  };

  const getDaysAgo = (createdAt) => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate - createdDate; // Time difference in milliseconds
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert to days

    return daysDifference;
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <Link to={`/profile/${post.author._id}`}>
              <AvatarImage src={post.author?.profilePicture} alt="post_image" />
            </Link>
            <AvatarFallback>
              {post.author?.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-3">
            <h1>
              {post.author.username.charAt(0).toUpperCase() +
                post.author.username.slice(1).toLowerCase()}
            </h1>
            {post.author._id === user._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>
        <Dialog open={dopen}>
          <DialogDescription className="hidden"></DialogDescription>
          <DialogTitle className="hidden"></DialogTitle>
          <DialogTrigger asChild>
            <MoreHorizontal onClick={openHandler} className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent
            onInteractOutside={outsideHandler}
            className="flex flex-col items-center text-sm text-center"
          >
            {post.author._id !== user._id ? (
              post.author.followers.length > 0 ? (
                <Button
                  variant="ghost"
                  className="cursor-pointer w-fit text-[#ED4956]"
                  onClick={followUnfollowHandler}
                >
                  Unfollow
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="cursor-pointer w-fit text-[#ED4956]"
                  onClick={followUnfollowHandler}
                >
                  Follow
                </Button>
              )
            ) : null}

            <Button
              variant="ghost"
              onClick={bookmarkHandler}
              className="cursor-pointer w-fit"
            >
              {bookmarkType === "saved"
                ? "Remove from favourites"
                : "Add to favourites"}
            </Button>
            {user &&
              user?._id === post.author?._id &&
              (loading ? (
                <Button variant="ghost">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="cursor-pointer w-fit"
                  onClick={deletePostHandler}
                >
                  Delete
                </Button>
              ))}
          </DialogContent>
        </Dialog>
      </div>
      <img
        className="rounded-sm my-2 w-full aspect-square object-cover"
        src={post.image}
        alt="post_img"
      />

      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          {liked ? (
            <FaHeart
              className="cursor-pointer text-red-600"
              size={"22px"}
              onClick={() => likeOrDislikeHandler(post._id)}
            />
          ) : (
            <FaRegHeart
              className="cursor-pointer hover:text-gray-600"
              size={"22px"}
              onClick={() => likeOrDislikeHandler(post._id)}
            />
          )}
          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-600"
          />
          <Send className="cursor-pointer hover:text-gray-600" />
        </div>
        {bookmarkType == "saved" ? (
          <BookmarkCheck
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-600"
          />
        ) : (
          <Bookmark
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-600"
          />
        )}
      </div>
      <div className="flex justify-between items-center">
        <span className="font-medium block mb-2">{postLike} likes</span>
        {<p>{getDaysAgo(post.createdAt)}d ago</p>}
      </div>

      <p>
        <span className="font-medium mr-2">{post.author?.username}</span>
        {post?.caption}
      </p>
      <span
        onClick={() => setOpen(true)}
        className="cursor-pointer text-sm text-gray-400"
      >
        {comment?.length > 0 ? (
          <div
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
          >
            View all {comment?.length} comments
          </div>
        ) : (
          <div
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
          >
            No comments, add a comment
          </div>
        )}
      </span>
      <CommentDialog open={open} setOpen={setOpen} />
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
          className="outline-none text-sm w-full"
        />
        {text && (
          <span
            onClick={commentHandler}
            className="text-[#3BADF8] cursor-pointer"
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
