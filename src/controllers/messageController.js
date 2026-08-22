import mongoose from "mongoose";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { generateAiResponse } from "../service/openRouterService.js";
import { buildMessageForAI } from "../utils/chatContext.js";
import {
    hasTokenLimitReached,
    resetUsageIfNeeded,
    addUserTokenUsage
} from "../utils/userUsage.js";
import { updateSummaryIfNeeded } from "../service/summaryServices.js";


// ==============================
// GET ALL MESSAGES OF ONE CHAT
// ==============================

export const getMessage = async (req, res) => {
    try {
        const { chatId } = req.params;

        // 1. Validate MongoDB ObjectId
        // Invalid ID হলে Mongoose CastError হওয়ার আগেই response দিয়ে দেব
        if (!mongoose.isObjectIdOrHexString(chatId)) {
            return res.status(400).json({
                message: "Invalid Chat ID"
            });
        }


        // 2. Check whether this chat belongs to logged-in user
        // শুধু chatId দিয়ে search করলে অন্য user's chat access হওয়ার risk থাকে
        const chat = await Chat.findOne({
            _id: chatId,
            userId: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat Not Found"
            });
        }


        // 3. Get all messages of this chat
        // createdAt: 1 => oldest message first, newest message last
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


        // =====================================================
        // 1. VALIDATE USER MESSAGE
        // =====================================================

        // typeof check added কারণ content object/number হলে
        // content.trim() runtime error দিতে পারে
        if (
            typeof content !== "string" ||
            content.trim() === ""
        ) {
            return res.status(400).json({
                message: "Content Missing"
            });
        }

        const cleanContent = content.trim();


        // =====================================================
        // 2. RESET USER TOKEN LIMIT IF RESET TIME HAS PASSED
        // =====================================================

        await resetUsageIfNeeded(req.user);


        // =====================================================
        // 3. CHECK USER TOKEN LIMIT
        // =====================================================

        if (hasTokenLimitReached(req.user)) {
            return res.status(429).json({
                message: "Token limit reached. Please try after some time.",
                usage: req.user.usage
            });
        }


        // This variable will contain either:
        // existing chat OR newly created chat
        let chat;


        // =====================================================
        // 4. EXISTING CHAT CASE
        // =====================================================

        if (chatId) {

            // Validate chatId
            if (!mongoose.isObjectIdOrHexString(chatId)) {
                return res.status(400).json({
                    message: "Invalid Chat ID"
                });
            }


            // Verify ownership
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


        // =====================================================
        // 5. NEW CHAT CASE
        // =====================================================

        else {

            // New chat-এর জন্য model অবশ্যই লাগবে
            if (!model) {
                return res.status(400).json({
                    message: "Model Is Required!"
                });
            }


            // First user message থেকে initial topic তৈরি করছি
            chat = await Chat.create({
                userId: req.user._id,
                model,
                topic: cleanContent.slice(0, 40)
            });
        }


        // =====================================================
        // 6. GET UNSUMMARIZED OLD MESSAGES
        // =====================================================

        /*
            Example:

            Total previous messages = 20

            summarizedTillMessageNumber = 14

            skip(14)

            AI context-এ যাবে:
            Message 15
            Message 16
            ...
            Message 20

            এর সাথে chat.summary আলাদাভাবে
            buildMessageForAI() add করবে।
        */

        const oldMessages = await Message.find({
            chatId: chat._id
        })
            .sort({
                createdAt: 1
            })
            .skip(chat.summarizedTillMessageNumber)
            .lean();


        // =====================================================
        // 7. BUILD FINAL CONTEXT FOR AI
        // =====================================================

        /*
            buildMessageForAI() ideally creates:

            [
                system prompt,

                previous summary,

                unsummarized previous messages,

                current user message
            ]
        */

        const messagesForAI = buildMessageForAI({
            chat,
            oldMessages,
            currentMessage: cleanContent
        });


        // =====================================================
        // 8. CALL AI MODEL
        // =====================================================

        /*
            Existing chat হলে body-এর model ignore করছি।

            কারণ একটি chat already একটি model-এর সাথে associated:

            chat.model
        */

        const {
            aiReply,
            usage
        } = await generateAiResponse({
            model: chat.model,
            messages: messagesForAI
        });


        // =====================================================
        // 9. SAVE USER MESSAGE
        // =====================================================

        const userMessage = await Message.create({
            chatId: chat._id,
            userId: req.user._id,
            role: "user",
            content: cleanContent
        });


        // =====================================================
        // 10. SAVE ASSISTANT MESSAGE
        // =====================================================

        const assistantMessage = await Message.create({
            chatId: chat._id,
            userId: req.user._id,
            role: "assistant",
            content: aiReply,
            usage
        });


        // =====================================================
        // 11. UPDATE CHAT MESSAGE COUNT
        // =====================================================

        // One user message + one assistant message
        chat.messageCount += 2;


        // =====================================================
        // 12. UPDATE CHAT TOKEN USAGE
        // =====================================================

        /*
            addChatTokenUsage():

            chat.usage.promptTokens += usage.promptTokens
            chat.usage.completionTokens += usage.completionTokens
            chat.usage.totalTokens += usage.totalTokens

            তারপর chat.save()

            তাই messageCount-ও একই save()-এ persist হবে।
        */

        await addChatTokenUsage(
            chat,
            usage
        );


        // =====================================================
        // 13. UPDATE USER TOKEN USAGE
        // =====================================================

        /*
            Current reset-period usage:

            user.usage.tokenUsed

            Lifetime usage:

            user.usage.totalTokenUsed
        */

        await addUserTokenUsage(
            req.user,
            usage.totalTokens
        );


        // =====================================================
        // 14. SEND RESPONSE TO FRONTEND
        // =====================================================

        res.status(201).json({
            message: "Message Sent Successfully",
            chatId: chat._id,
            reply: aiReply,
            usage,
            userMessage,
            assistantMessage
        });


        // =====================================================
        // 15. UPDATE SUMMARY IN BACKGROUND
        // =====================================================

        /*
            User-কে AI response পাওয়ার জন্য summary generation
            শেষ হওয়া পর্যন্ত অপেক্ষা করাচ্ছি না।

            কিন্তু error catch করছি যাতে unhandled rejection না হয়।
        */

        updateSummaryIfNeeded(chat._id)
            .catch((error) => {
                console.log(
                    "Error While Updating Chat Summary:",
                    error
                );
            });


    } catch (error) {
        console.log("Error In sendMessage:", error);

        return res.status(500).json({
            message: "Internal Server Error!"
        });
    }
};