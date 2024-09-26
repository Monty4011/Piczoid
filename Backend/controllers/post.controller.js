import sharp from "sharp"
import { Post } from "../models/post.model.js"
import { User } from "../models/user.model.js"
import { Comment } from "../models/comment.model.js"
import { deleteImageFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiError } from "../utils/ApiError.js"
import { getReceiverSocketId, io } from "../socket/socket.js"

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body
        const authorId = req.id

        const imageLocalPath = req.file?.path
        if (!imageLocalPath) {
            return res.status(400).json({
                message: "Image is required",
                success: false
            })
        }

        const image = await uploadOnCloudinary(imageLocalPath)
        if (!image) {
            return res.status(400).json({
                message: "Error uploading image",
                success: false
            })
        }

        const post = await Post.create({
            caption,
            image: image.url,
            author: authorId
        })

        const user = await User.findById(authorId)
        if (user) {
            user.posts.push(post._id)
            await user.save()
        }

        const createdPost = await Post.findById(post._id)
        if (!createdPost) {
            return res.status(500).json({
                message: "Something went wrong while creating post",
                success: false
            })
        }

        await createdPost.populate({ path: "author", select: "-password" })

        return res.status(201).json({
            message: "Post added successfully",
            post: createdPost,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: "author", select: "-password -createdAt -updatedAt" })
            .populate({ path: "comments", sort: { createdAt: -1 }, populate: { path: "author", select: "username profilePicture" } })

        return res.status(200).json({
            message: "All posts fetched successfully",
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
            .populate({ path: "author", select: "username profilePicture" })
            .populate({ path: "comments", sort: { createdAt: -1 }, populate: { path: "author", select: "username profilePicture" } })

        return res.status(200).json({
            message: "User posts fetched successfully",
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const likePost = async (req, res) => {
    try {
        const likedBy = req.id
        const postId = req.params.id

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            })
        }
        await post.updateOne({ $addToSet: { likes: likedBy } })
        await post.save()

        // implement socket.io for real time notifications
        const user = await User.findById(likedBy).select("username profilePicture")
        const postOwnerId = post.author.toString()
        if (postOwnerId !== likedBy) {
            const notification = {
                type: "like",
                userId: likedBy,
                userDetails: user,
                postId,
                message: "Your post was liked"
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId)
            io.to(postOwnerSocketId).emit("notification", notification)
        }

        return res.status(200).json({
            message: "Post liked successfully",
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

export const dislikePost = async (req, res) => {
    try {
        const dislikedBy = req.id
        const postId = req.params.id

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            })
        }
        await post.updateOne({ $pull: { likes: dislikedBy } })
        await post.save()

        // implement socket.io for real time notifications
        const user = await User.findById(dislikedBy).select("username profilePicture")
        const postOwnerId = post.author.toString()
        if (postOwnerId !== dislikedBy) {
            const notification = {
                type: "dislike",
                userId: dislikedBy,
                userDetails: user,
                postId,
                message: "Your post was disliked"
            }
            const postOwnerSocketId = getReceiverSocketId(postOwnerId)
            io.to(postOwnerSocketId).emit("notification", notification)
        }

        return res.status(200).json({
            message: "Post disliked successfully",
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

export const addComment = async (req, res) => {
    try {
        const postId = req.params.id
        const userId = req.id
        const { text } = req.body
        if (!text) {
            return res.status(400).json({
                message: "Comment text is required",
                success: false
            })
        }

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            })
        }

        const comment = await Comment.create({
            text,
            author: userId,
            post: postId
        })
        await comment.save()
        comment.populate({ path: "author", select: "username profilePicture" })

        post.comments.push(comment._id)
        await post.save()

        return res.status(201).json({
            message: "Comment aded successfully",
            comment,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

export const getPostComments = async (req, res) => {
    try {
        const postId = req.params.id

        const comments = await Comment.find({ post: postId }).populate({ path: "author", select: "username profilePicture" })

        if (!comments) {
            return res.status(404).json({
                message: "No comments found for this post",
                success: false
            })
        }

        return res.status(200).json({
            message: "Comments fetched successfully",
            comments,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id
        const authorId = req.id

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            })
        }

        if (post.author.toString() !== authorId) {
            return res.status(403).json({
                message: "Unauthorized access",
                success: false
            })
        }
        // remove image from cloudinary
        const existingImageUrl = post.image;
        if (!existingImageUrl) {
            throw new ApiError(400, "Image URL is missing in the post record");
        }

        const publicIdImage = existingImageUrl.split('/').pop().split('.')[0];

        if (publicIdImage) {
            try {
                await deleteImageFromCloudinary(publicIdImage);
            } catch (error) {
                throw new ApiError(500, "Error deleting image from Cloudinary: " + error.message);
            }
        }
        // remove post from user posts
        const user = await User.findById(authorId)
        user.posts = user.posts.filter(id => id.toString() !== postId)
        await user.save()
        // remove all post comments
        await Comment.deleteMany({ post: postId })
        // remove post from db
        await Post.findByIdAndDelete(postId)

        return res.status(200).json({
            message: "Post deleted successfully",
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id
        const userId = req.id

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: "Post not found",
                success: false
            })
        }

        const user = await User.findById(userId)

        if (user.bookmarks.includes(postId)) {
            // remove from bookmark
            await user.updateOne({ $pull: { bookmarks: postId } })
            await user.save();
            return res.status(200).json({
                type: "unsaved",
                message: "Post removed from bookmark successfully",
                success: true
            })
        }
        else {
            // add to bookmark
            await user.updateOne({ $addToSet: { bookmarks: postId } })
            await user.save();
            return res.status(200).json({
                type: "saved",
                message: "Post added to bookmark successfully",
                success: true
            })
        }

    } catch (error) {
        console.log(error);
    }
}