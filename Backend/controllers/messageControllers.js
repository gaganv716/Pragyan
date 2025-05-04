const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Abuse = require("../models/abuseModel");
const axios = require("axios");
const { checkAbuse, checkAudioAbuse, checkImageAbuse } = require("../Middlewares/helper");

const sendMessage = async (req, res) => {
  const { io } = require("../index");
  const { content, chatId, mediaUrl, messageType } = req.body;
  const senderId = req.user._id;

  const chatIdValue = typeof chatId === "object" ? chatId._id : chatId;

  if ((!content && !mediaUrl) || !chatIdValue) {
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: senderId,
    content: content || "",
    chat: chatIdValue,
    messageType: messageType || "text",
    mediaUrl: mediaUrl || null,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatIdValue, {
      latestMessage: message,
    });

    const receiver = message.chat.users.find(
      (u) => u._id.toString() !== senderId.toString()
    );

    let isAbusive = false;

    // === Abusive Check Starts ===
    try {
      if (message.messageType === "text" && message.content) {
        isAbusive = await checkAbuse(message.content);
      } else if (message.messageType === "audio" && message.mediaUrl) {
        isAbusive = await checkAudioAbuse(message.mediaUrl);
      } else if (message.messageType === "image" && message.mediaUrl) {
        isAbusive = await checkImageAbuse(message.mediaUrl);
      }
    } catch (err) {
      console.error(`${message.messageType} abuse detection failed:`, err.message);
    }

    // === If abusive, record and emit ===
    if (isAbusive) {
      const pastCount = await Abuse.countDocuments({
        fromUser: senderId,
        toUser: receiver._id,
      });

      await Abuse.create({
        fromUser: senderId,
        toUser: receiver._id,
        count: pastCount + 1,
        lastAbuseType: message.messageType,
      });

      if (io?.to) {
        io.to(senderId.toString()).emit("abuse:warning", {
          message: "⚠️ Your message was flagged as abusive!",
          count: pastCount + 1,
          type: message.messageType,
        });

        io.to(receiver._id.toString()).emit("abuse:alert", {
          message: "🚨 You received an abusive message!",
          from: message.sender.name,
          type: message.messageType,
        });
      } else {
        console.error("Socket.io instance is not available");
      }
    }
    // === Abusive Check Ends ===

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};


const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

module.exports = { sendMessage, allMessages };
