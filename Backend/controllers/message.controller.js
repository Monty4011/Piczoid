// for chatting
import { Conversation } from "../models/conversation.model.js"
import { Message } from "../models/message.model.js"
import { User } from "../models/user.model.js"
import { getReceiverSocketId, io } from "../socket/socket.js"

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id
        const receiverId = req.params.id
        const { textMessage: message } = req.body

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        })
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            })
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        })

        if (newMessage) {
            conversation.messages.push(newMessage._id)
        }
        await newMessage.save();
        await conversation.save();

        // implement socket.io fro real time data transfer
        const receiverSocketId = getReceiverSocketId(receiverId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }
        // implement socket.io fro real time notification
        const user = await User.findById(senderId).select("username profilePicture")
        const messageReceiverId = receiverId
        if (messageReceiverId !== senderId) {

            const newMessageReceived = {
                type: "message",
                userId: senderId,
                userDetails: user,
                message: "New message received"
            }
            if (receiverSocketId) {
                // console.log("io called");
                io.to(receiverSocketId).emit("newMessageNotification", newMessageReceived)
            }
        }

        return res.status(201).json({
            message: "Message created successfully",
            newMessage,
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

export const getMessage = async (req, res) => {
    try {
        const senderId = req.id
        const receiverId = req.params.id

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate("messages")
        if (!conversation) {
            return res.status(200).json({
                message: "",
                messages: [],
                success: true
            })
        }
        return res.status(200).json({
            message: "All messages fetched successfully",
            messages: conversation?.messages || [],
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}