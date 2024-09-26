import bcrypt from "bcryptjs"
import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import jwt from "jsonwebtoken"
import { uploadOnCloudinary, deleteImageFromCloudinary } from "../utils/cloudinary.js"

export const register = async (req, res) => {
    try {
        const { username, email, password, bio, gender } = req.body

        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing",
                success: false
            })
        }

        const userExist = await User.findOne({ email })
        if (userExist) {
            return res.status(401).json({
                message: "User already registered",
                success: false
            })
        }
        let profilePicture
        const profilePictureLocalPath = req.file?.path
        if (profilePictureLocalPath) {
            // return res.status(400).json({
            //     message: "Profile Picture file is missing",
            //     success: false
            // })
            profilePicture = await uploadOnCloudinary(profilePictureLocalPath)

            if (!profilePicture) {
                return res.status(400).json({
                    message: "Error uploading profile picture",
                    success: false
                })
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username: username.toLowerCase(),
            email,
            password: hashedPassword,
            bio,
            gender,
            profilePicture: profilePicture?.url || ""
        })

        const createdUser = await User.findById(user._id).select(
            "-password"
        )

        if (!createdUser) {
            return res.status(500).json({
                message: "Something went wrong while registering user",
                success: false
            })
        }

        return res.status(201).json({
            message: "User registered successfully",
            createdUser,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing",
                success: false
            })
        }

        const userExist = await User.findOne({ email })
        if (!userExist) {
            return res.status(401).json({
                message: "User doesn't exist",
                success: false
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, userExist.password)
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect password",
                success: false
            })
        }
        const user = await User.findOne({ email }).select("-password")

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' })

        // Populate posts
        const populatedPosts = await Promise.all(
            user.posts.map(async (postId) => {
                const post = await Post.findById(postId);
                // Only include posts where the author matches
                if (post && post.author.equals(user._id)) {
                    return post;
                }
                return null;
            })
        );

        // Filter out null posts
        user.posts = populatedPosts.filter(post => post !== null);

        // Save user with populated posts
        await user.save();

        return res
            .status(200)
            .cookie("token", token, { httpOnly: true, sameSite: "strict", maxAge: 1 * 24 * 60 * 60 * 1000 })
            .json({
                message: `Welcome back ${user.username}`,
                user,
                success: true
            })

    } catch (error) {
        console.log(error);
    }
}

export const logout = async (req, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out succesfully",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate({ path: "posts", options: { sort: { createdAt: -1 } } }).populate("bookmarks").select("-password")
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }
        return res.status(200).json({
            message: "User fetched successfully",
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender, taglines } = req.body;
        const profilePictureLocalPath = req.file?.path;

        const updateFields = {};

        // If bio is provided, add it to updateFields
        if (bio) {
            updateFields.bio = bio;
        }

        // If gender is provided, add it to updateFields
        if (gender) {
            updateFields.gender = gender;
        }

        if (taglines) {
            updateFields.taglines = Array.isArray(taglines)
                ? taglines
                : taglines.split(',').map(tagline => tagline.trim());
        }

        // If a new profile picture is uploaded, handle Cloudinary upload and deletion
        if (profilePictureLocalPath) {
            const prevUser = await User.findById(userId).select("profilePicture");

            if (!prevUser) {
                return res.status(404).json({
                    message: "User not found",
                    success: false
                });
            }

            const existingProfilePictureUrl = prevUser.profilePicture;
            const publicIdProfilePicture = existingProfilePictureUrl?.split('/').pop().split('.')[0];

            // Delete previous profile picture from Cloudinary if it exists
            if (publicIdProfilePicture) {
                try {
                    await deleteImageFromCloudinary(publicIdProfilePicture);
                } catch (error) {
                    return res.status(500).json({
                        message: `Error deleting profile picture from Cloudinary: ${error.message}`,
                        success: false
                    });
                }
            }

            // Upload new profile picture
            const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);
            if (!profilePicture?.url) {
                return res.status(400).json({
                    message: "Error uploading profile picture",
                    success: false
                });
            }

            // Add the new profile picture URL to the updateFields
            updateFields.profilePicture = profilePicture.url;
        }

        // If no fields to update, return an error response
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                message: "No fields provided for update",
                success: false
            });
        }

        // Update user profile with the provided fields
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true } // Return updated document
        ).select("-password");

        if (!updatedUser) {
            return res.status(500).json({
                message: "Error updating user profile",
                success: false
            });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password")
        if (!suggestedUsers) {
            return res.status(400).json({
                message: "Currently no suggested users",
                success: false
            })
        }
        return res.status(200).json({
            message: "Suggested users fetched successfully",
            users: suggestedUsers,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const followUnfollow = async (req, res) => {
    try {
        const followedBy = req.id // jatin
        const followedTo = req.params.id // diljit

        if (followedBy === followedTo) {
            return res.status(400).json({
                message: "Can not follow yourself",
                success: false
            })
        }

        const user = await User.findById(followedBy)
        const targetUser = await User.findById(followedTo)

        if (!user || !targetUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }

        const isFollowing = user.following.includes(followedTo)
        if (isFollowing) {
            // unfollow
            await Promise.all([
                User.updateOne({ _id: followedBy }, { $pull: { following: followedTo } }),
                User.updateOne({ _id: followedTo }, { $pull: { followers: followedBy } })
            ])
            return res.status(200).json({
                message: "Unfollowed successfully",
                type: "unfollow",
                success: true
            })
        }
        else {
            // follow
            await Promise.all([
                User.updateOne({ _id: followedBy }, { $push: { following: followedTo } }),
                User.updateOne({ _id: followedTo }, { $push: { followers: followedBy } })
            ])
            return res.status(200).json({
                message: "Followed successfully",
                type: "follow",
                success: true
            })
        }
    } catch (error) {
        console.log(error);
    }
}