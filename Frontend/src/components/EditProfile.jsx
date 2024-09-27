import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

const EditProfile = () => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const imageRef = useRef();
  const [input, setInput] = useState({
    profilePicture: user.profilePicture || null,
    bio: user.bio,
    gender: user.gender,
    taglines: user?.taglines || [],
  });

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput({ ...input, profilePicture: file });
    }
  };

  const selectChangeHandler = (value) => {
    setInput({ ...input, gender: value });
  };

  const editProfileHandler = async () => {
    const formdata = new FormData();

    formdata.append("bio", input.bio || ""); // Append empty strings if values are not provided
    formdata.append("gender", input.gender || "");

    if (Array.isArray(input.taglines)) {
      input.taglines.forEach((tagline) =>
        formdata.append("taglines[]", tagline.trim())
      );
    } else if (typeof input.taglines === "string") {
      input.taglines
        .split(",")
        .forEach((tagline) => formdata.append("taglines[]", tagline.trim()));
    }

    if (input.profilePicture) {
      formdata.append("profilePicture", input.profilePicture);
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://piczoid.onrender.com/api/v1/user/profile/edit",
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const updatedUserData = {
          ...user,
          bio: res.data.user?.bio,
          gender: res.data.user?.gender,
          profilePicture: res.data.user?.profilePicture,
          taglines: res.data.user?.taglines,
        };

        dispatch(setAuthUser(updatedUserData));
        navigate(`/profile/${user._id}`);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex p-4 max-w-2xl mx-auto sm:pl-10">
      <section className="flex flex-col gap-6 w-full my-8">
        <h1 className="text-center font-bold text-xl">Edit Profile</h1>
        <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.profilePicture} alt="post_image" />
              <AvatarFallback>
                {user?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold text-sm">
                {user?.username?.charAt(0).toUpperCase() +
                  user?.username?.slice(1).toLowerCase()}
              </h1>
              <span className="hidden sm:inline text-gray-600">
                {user?.bio}
              </span>
            </div>
          </div>
          <input
            ref={imageRef}
            type="file"
            className="hidden"
            onChange={fileChangeHandler}
          />
          <Button
            className="bg-[#0095F6] w-fit h-fit p-1 sm:h-8 hover:bg-[#318bc7]"
            onClick={() => imageRef?.current.click()}
          >
            Change photo
          </Button>
        </div>
        <div>
          <h1 className="font-bold text-xl mb-2">Bio</h1>
          <Textarea
            value={input.bio}
            name="bio"
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
            className="focus-visible:ring-transparent"
          />
        </div>
        <div>
          <h1 className="font-bold mb-2">Gender</h1>
          <Select
            defaultValue={input.gender}
            onValueChange={selectChangeHandler}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <h1 className="font-bold text-xl mb-2">Taglines</h1>
          <Textarea
            value={input.taglines}
            name="taglines"
            onChange={(e) => setInput({ ...input, taglines: e.target.value })}
            className="focus-visible:ring-transparent"
          />
        </div>
        <div className="flex justify-end">
          {loading ? (
            <Button className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="w-fit bg-[#0095F6] hover:bg-[#2a8ccd]"
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
