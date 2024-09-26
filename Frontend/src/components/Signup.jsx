import React, { useState,useEffect } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import axios from "axios";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Signup = () => {
  const {user} = useSelector(store=>store.auth)
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    gender: "",
    profilePicture: null,
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleGenderChange = (value) => {
    setInput({ ...input, gender: value });
  };

  const handleFileChange = (e) => {
    setInput({ ...input, profilePicture: e.target.files[0] });
  };

  const signupHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", input.username);
    formData.append("email", input.email);
    formData.append("password", input.password);
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    // Append the file (profile picture)
    if (input.profilePicture) {
      formData.append("profilePicture", input.profilePicture);
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
        setInput({
          username: "",
          email: "",
          password: "",
          bio: "",
          gender: "",
          profilePicture: null,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        className="shadow-lg flex flex-col gap-3 p-8"
        onSubmit={signupHandler}
      >
        <div className="my-2 flex flex-col items-center">
          <img src="/logo.svg" alt="logo" className="w-10" />
          <p className="text-sm text-center">
            Sign up to discover moments shared by your friends.
          </p>
        </div>
        <div>
          <span className="font-medium">Username</span>
          <Input
            type="text"
            name="username"
            onChange={changeEventHandler}
            value={input.username}
            className="focus-visible:ring-transparent my-1"
          />
        </div>
        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            onChange={changeEventHandler}
            value={input.email}
            className="focus-visible:ring-transparent my-1"
          />
        </div>
        <div>
          <span className="font-medium">Password</span>
          <Input
            type="password"
            name="password"
            onChange={changeEventHandler}
            value={input.password}
            className="focus-visible:ring-transparent my-1"
          />
        </div>
        <div>
          <span className="font-medium">Bio</span>
          <Input
            type="text"
            name="bio"
            onChange={changeEventHandler}
            value={input.bio}
            className="focus-visible:ring-transparent my-1"
          />
        </div>
        <div className="flex items-center gap-5">
          <span className="font-medium">Gender</span>
          <Select
            className="my-1"
            value={input.gender}
            onValueChange={handleGenderChange}
          >
            <SelectTrigger className="">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Gender</SelectLabel>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center ">
          <span className="font-medium">Profile Picture</span>
          <Input
            type="file"
            name="profilePicture"
            onChange={handleFileChange}
            className="focus-visible:ring-transparent my-1"
          />
        </div>
        {loading ? (
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please Wait
          </Button>
        ) : (
          <Button type="submit">Signup</Button>
        )}
        <span className="text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
};

export default Signup;
