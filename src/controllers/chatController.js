import mongoose from "mongoose";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";


// =============================
// GET RECENT 20 CHATS
// =============================

export const getRecentTwentyChat = async (req, res) => {
    try {

        const chats = await Chat.find({
            userId: req.user._id
        })
        .select("topic updatedAt")
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean();

        return res.status(200).json({
            message: "Your Recent Chats",
            chats
        });

    } catch (error) {

        console.log(
            "Error While Fetching Recent Chats:",
            error
        );

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


// =============================
// CREATE CHAT
// =============================

export const createChat = async (req, res) => {
    try {

        const { model } = req.body;

        if (!model) {
            return res.status(400).json({
                message: "Model Name Is Not Defined"
            });
        }

        const chat = await Chat.create({
            userId: req.user._id,
            model
        });

        return res.status(201).json({
            message: "Chat Created Successfully",
            chatId: chat._id,
            userId: chat.userId,
            model: chat.model,
            topic: chat.topic
        });

    } catch (error) {

        console.log(
            "Error While Creating Chat:",
            error
        );

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


// =============================
// GET SINGLE CHAT
// =============================

export const getSingleChat = async (req, res) => {
    try {

        const { chatId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                message: "Invalid Chat Id"
            });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            userId: req.user._id
        }).lean();

        if (!chat) {
            return res.status(404).json({
                message: "Chat Not Found"
            });
        }

        return res.status(200).json({
            message: "Your Chat",

            chat: {
                chatId: chat._id,
                userId: chat.userId,
                model: chat.model,
                topic: chat.topic,
                usage: chat.usage,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt
            }
        });

    } catch (error) {

        console.log(
            "Error While Fetching Single Chat:",
            error
        );

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};


// =============================
// DELETE CHAT
// =============================

export const deleteChat = async (req, res) => {
    try {

        const { chatId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({
                message: "Invalid Chat Id"
            });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            userId: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat Not Found"
            });
        }

        // Delete messages first
        await Message.deleteMany({
            chatId: chat._id
        });

        // Delete chat
        await Chat.deleteOne({
            _id: chat._id
        });

        return res.status(200).json({
            message: "Chat Deleted Successfully"
        });

    } catch (error) {

        console.log(
            "Error While Deleting Chat:",
            error
        );

        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
};