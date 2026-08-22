import mongoose from "mongoose";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";


// ==============================
// GET ALL MESSAGES OF ONE CHAT
// ==============================

export const getMessage = async (req, res) => {
    try {
        const { chatId } = req.params;

        // Validate chatId
        if (!mongoose.isObjectIdOrHexString(chatId)) {
            return res.status(400).json({
                message: "Invalid Chat ID"
            });
        }

        // Verify chat belongs to logged-in user
        const chat = await Chat.findOne({
            _id: chatId,
            userId: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat Not Found"
            });
        }

        // Get all messages oldest -> newest
        const messages = await Message.find({
            chatId: chat._id,
            userId: req.user._id
        })
        .sort({
            createdAt: 1
        })
        .lean();

        return res.status(200).json({
            message: "Your All Messages Are Here",
            messages
        });

    } catch (error) {
        console.log("Error In getMessage:", error);

        return res.status(500).json({
            message: "Internal Server Error!"
        });
    }
};


// ==============================
// SEND MESSAGE
// ==============================

export const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content, model } = req.body;

        if (!content || content.trim() === "") {
            return res.status(400).json({
                message: "Content Missing"
            });
        }

        let chat;


        // ==========================
        // EXISTING CHAT
        // ==========================

        if (chatId) {

            if (!mongoose.isObjectIdOrHexString(chatId)) {
                return res.status(400).json({
                    message: "Invalid Chat ID"
                });
            }

            chat = await Chat.findOne({
                _id: chatId,
                userId: req.user._id
            });

            if (!chat) {
                return res.status(404).json({
                    message: "Chat Not Found"
                });
            }

        }


        // ==========================
        // NEW CHAT
        // ==========================

        else {

            if (!model) {
                return res.status(400).json({
                    message: "Model Is Required!"
                });
            }

            chat = await Chat.create({
                userId: req.user._id,
                model
            });
        }


        // ==========================
        // SAVE USER MESSAGE
        // ==========================

        const userMsg = await Message.create({
            userId: req.user._id,
            chatId: chat._id,
            role: "user",
            content: content.trim()
        });


        // ==========================
        // SEND MESSAGE TO AI
        // ==========================

        const dummyReply = "Mai Changs SI";


        // ==========================
        // SAVE AI MESSAGE
        // ==========================

        const aiMsg = await Message.create({
            userId: req.user._id,
            chatId: chat._id,
            role: "assistant",
            content: dummyReply
        });


        // Update chat activity
        chat.messageCount += 2;

        await chat.save();


        return res.status(201).json({
            message: "AI Reply Generated Successfully",

            chatId: chat._id,

            userMessage: userMsg,

            assistantMessage: aiMsg
        });

    } catch (error) {
        console.log("Error In sendMessage:", error);

        return res.status(500).json({
            message: "Internal Server Error!"
        });
    }
};