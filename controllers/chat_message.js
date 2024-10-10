import { ChatMessage } from "../models/index.js";
import { io, getFilePath } from "../utils/index.js";
import mongoose from "mongoose";

async function sendText(req, res) {
  try {
    const { chat_id, message } = req.body;
    const { user_id } = req.user;

    const chat_message = new ChatMessage({
      chat: chat_id,
      user: user_id,
      message,
      type: "TEXT",
    });

    const savedMessage = await chat_message.save();
    const data = await savedMessage.populate("user");

    io.sockets.in(chat_id).emit("message", data);
    io.sockets.in(`${chat_id}_notify`).emit("message_notify", data);

    res.status(201).send({});
  } catch (error) {
    console.error(error);
    res.status(400).send({ msg: "Error al enviar el mensaje" });
  }
}


async function sendImage(req, res) {
  try {
    const { chat_id } = req.body;
    const { user_id } = req.user;

    const chat_message = new ChatMessage({
      chat: chat_id,
      user: user_id,
      message: getFilePath(req.files.image),
      type: "IMAGE",
    });

    const savedMessage = await chat_message.save();
    const data = await savedMessage.populate("user");

    io.sockets.in(chat_id).emit("message", data);
    io.sockets.in(`${chat_id}_notify`).emit("message_notify", data);

    res.status(201).send({});
  } catch (error) {
    console.error(error);
    res.status(400).send({ msg: "Error al enviar el mensaje" });
  }
}


async function getAll(req, res) {
  const { chat_id } = req.params;

  // Verificar si chat_id es un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(chat_id)) {
    return res.status(400).send({ msg: "ID de chat no válido" });
  }

  try {
    // Ejecutar las dos consultas en paralelo para mejorar la eficiencia
    const [messages, total] = await Promise.all([
      ChatMessage.find({ chat: chat_id })
        .sort({ createdAt: 1 })
        .populate("user"),
      ChatMessage.countDocuments({ chat: chat_id }),
    ]);

    // Responder con los mensajes y el total
    res.status(200).send({ messages, total });
  } catch (error) {
    console.error("Error al obtener los mensajes:", error); // Imprimir el error en la consola
    res.status(500).send({ msg: "Error del servidor", error: error.message }); // Enviar detalles del error
  }
}


async function getTotalMessages(req, res) {
  const { chat_id } = req.params;

  try {
    if (!chat_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({ msg: "ID de chat no válido" });
    }

    const response = await ChatMessage.find({ chat: chat_id }).countDocuments();
    res.status(200).json({ totalMessages: response });
  } catch (error) {
    console.error("Error al obtener el total de mensajes:", error); // Imprime el error en la consola
    res.status(500).send({ msg: "Error del servidor" });
  }
}


async function getLastMessage(req, res) {
  const { chat_id } = req.params;

  try {
    // Validación del ID
    if (!chat_id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({ msg: "ID de chat no válido" });
    }

    const response = await ChatMessage.findOne({ chat: chat_id }).sort({
      createdAt: -1,
    });

    // Si no se encuentra el mensaje, retornar un 404
    if (!response) {
      return res.status(404).send({ msg: "No se encontró el último mensaje" });
    }

    res.status(200).send(response);
  } catch (error) {
    console.error("Error al obtener el último mensaje:", error);
    res.status(500).send({ msg: "Error del servidor" });
  }
}


export const ChatMessageController = {
  sendText,
  sendImage,
  getAll,
  getTotalMessages,
  getLastMessage,
};
