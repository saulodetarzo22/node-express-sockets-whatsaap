import { GroupMessage } from "../models/index.js";
import { io, getFilePath } from "../utils/index.js";

async function sendText(req, res) {
  try {
    const { group_id, message } = req.body;
    const { user_id } = req.user;

    const group_message = new GroupMessage({
      group: group_id,
      user: user_id,
      message,
      type: "TEXT",
    });

    // Guardamos el mensaje de grupo usando async/await
    await group_message.save();

    // Populamos el campo "user" y emitimos los eventos
    const data = await group_message.populate("user");

    io.sockets.in(group_id).emit("message", data);
    io.sockets.in(`${group_id}_notify`).emit("message_notify", data);

    res.status(201).send({});
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}


async function sendImage(req, res) {
  try {
    const { group_id } = req.body;
    const { user_id } = req.user;

    const group_message = new GroupMessage({
      group: group_id,
      user: user_id,
      message: getFilePath(req.files.image),
      type: "IMAGE",
    });

    // Guardar el mensaje de grupo usando async/await
    const savedMessage = await group_message.save();

    // Poblar el campo 'user' del mensaje guardado
    const populatedMessage = await savedMessage.populate("user");

    // Emitir el mensaje a los sockets correspondientes
    io.sockets.in(group_id).emit("message", populatedMessage);
    io.sockets.in(`${group_id}_notify`).emit("message_notify", populatedMessage);

    res.status(201).send({});
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}


async function getAll(req, res) {
  const { group_id } = req.params;

  try {
    const messages = await GroupMessage.find({ group: group_id })
      .sort({ createdAt: 1 })
      .populate("user");

    const total = await GroupMessage.countDocuments({ group: group_id });

    res.status(200).send({ messages, total });
  } catch (error) {
    console.error("Error fetching group messages:", error); // Log para más detalles
    res.status(500).send({ msg: "Error del servidor", error: error.message }); // Incluye el mensaje de error
  }
}


async function getTotalMessages(req, res) {
  const { group_id } = req.params;

  try {
    // Cambia a countDocuments para contar correctamente
    const total = await GroupMessage.countDocuments({ group: group_id });
    res.status(200).json({ total });  // Usar res.json en lugar de JSON.stringify
  } catch (error) {
    console.error("Error fetching total messages:", error); // Log para detalles del error
    res.status(500).send({ msg: "Error del servidor", error: error.message });  // Incluir el mensaje del error
  }
}

async function getLastMessage(req, res) {
  const { group_id } = req.params;

  try {
    const lastMessage = await GroupMessage.findOne({ group: group_id })
      .sort({ createdAt: -1 })
      .populate("user");

    res.status(200).json(lastMessage || {});  // Usar res.json para la respuesta
  } catch (error) {
    console.error("Error fetching last message:", error); // Log para detalles del error
    res.status(500).send({ msg: "Error del servidor", error: error.message });  // Incluir el mensaje del error
  }
}


export const GroupMessageController = {
  sendText,
  sendImage,
  getAll,
  getTotalMessages,
  getLastMessage,
};
