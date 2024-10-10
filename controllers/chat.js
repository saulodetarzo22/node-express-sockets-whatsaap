import { Chat, ChatMessage } from "../models/index.js";
import mongoose from "mongoose";

async function create(req, res) {
  const { participant_id_one, participant_id_two } = req.body;

  // Agrega un console.log para verificar el contenido de req.body
  console.log("Request Body:", req.body);

  // Asegúrate de que ambos IDs están presentes
  if (!participant_id_one || !participant_id_two) {
    return res.status(400).send({ msg: "Ambos participantes son obligatorios" });
  }

  // Valida que los IDs sean ObjectId válidos
  if (!mongoose.Types.ObjectId.isValid(participant_id_one) || !mongoose.Types.ObjectId.isValid(participant_id_two)) {
    return res.status(400).send({ msg: "Uno o ambos IDs de los participantes no son válidos" });
  }

  try {
    const foundOne = await Chat.findOne({
      participant_one: participant_id_one,
      participant_two: participant_id_two,
    });
    const foundTwo = await Chat.findOne({
      participant_one: participant_id_two,
      participant_two: participant_id_one,
    });

    if (foundOne || foundTwo) {
      return res.status(400).send({ msg: "Ya tienes un chat con este usuario" });
    }

    const chat = new Chat({
      participant_one: participant_id_one,
      participant_two: participant_id_two,
    });

    const chatStorage = await chat.save();
    return res.status(201).send(chatStorage);
  } catch (error) {
    return res.status(500).send({ msg: "Error al crear el chat", error });
  }
}


async function getAll(req, res) {
  const { user_id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    return res.status(400).send({ msg: "El ID de usuario no es válido" });
  }

  try {
    const chats = await Chat.find({
      $or: [{ participant_one: user_id }, { participant_two: user_id }],
    })
      .populate("participant_one")
      .populate("participant_two");

    const arrayChats = [];
    for (const chat of chats) {
      const response = await ChatMessage.findOne({ chat: chat._id }).sort({
        createdAt: -1,
      });

      arrayChats.push({
        ...chat._doc,
        last_message_date: response?.createdAt || null,
      });
    }

    res.status(200).send(arrayChats);
  } catch (error) {
    res.status(400).send({ msg: "Error al obtener los chats" });
  }
}

async function deleteChat(req, res) {
  const chat_id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(chat_id)) {
    return res.status(400).send({ msg: "El ID del chat no es válido" });
  }

  try {
    await Chat.findByIdAndDelete(chat_id);
    res.status(200).send({ msg: "Chat eliminado" });
  } catch (error) {
    res.status(400).send({ msg: "Error al eliminar el chat" });
  }
}

async function getChat(req, res) {
  const chat_id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(chat_id)) {
    return res.status(400).send({ msg: "El ID del chat no es válido" });
  }

  try {
    const chatStorage = await Chat.findById(chat_id)
      .populate("participant_one")
      .populate("participant_two");

    res.status(200).send(chatStorage);
  } catch (error) {
    res.status(400).send({ msg: "Error al obtener el chat" });
  }
}

export const ChatController = {
  create,
  getAll,
  deleteChat,
  getChat,
};
