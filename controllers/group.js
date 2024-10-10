import { User, Group, GroupMessage } from "../models/index.js";
import { getFilePath } from "../utils/index.js";

async function create(req, res) {
  try {
    const { user_id } = req.user;
    const group = new Group(req.body);
    group.creator = user_id;
    group.participants = JSON.parse(req.body.participants);
    group.participants = [...group.participants, user_id];

    if (req.files.image) {
      const imagePath = getFilePath(req.files.image);
      group.image = imagePath;
    }

    const groupStorage = await group.save(); // Usamos await en lugar de callback
    if (!groupStorage) {
      res.status(400).send({ msg: "Error al crear el grupo" });
    } else {
      res.status(201).send(groupStorage);
    }
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}


async function getAll(req, res) {
  try {
    const { user_id } = req.user;

    // Usamos await para obtener los grupos
    const groups = await Group.find({ participants: user_id })
      .populate("creator")
      .populate("participants");

    const arrayGroups = [];
    
    // Usamos for...of con await en lugar de for await
    for (const group of groups) {
      const response = await GroupMessage.findOne({ group: group._id }).sort({
        createdAt: -1,
      });

      arrayGroups.push({
        ...group._doc,
        last_message_date: response?.createdAt || null,
      });
    }

    res.status(200).send(arrayGroups);
  } catch (error) {
    res.status(500).send({ msg: "Error al obtener los grupos" });
  }
}


async function getGroup(req, res) {
  try {
    const group_id = req.params.id;
    const groupStorage = await Group.findById(group_id).populate("participants"); // Usamos await en lugar de callback
    
    if (!groupStorage) {
      res.status(400).send({ msg: "No se ha encontrado el grupo" });
    } else {
      res.status(200).send(groupStorage);
    }
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}


async function updateGroup(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const group = await Group.findById(id);

    if (name) group.name = name;

    if (req.files.image) {
      const imagePath = getFilePath(req.files.image);
      group.image = imagePath;
    }

    await Group.findByIdAndUpdate(id, group); // Usamos await en lugar de callback

    res.status(200).send({ image: group.image, name: group.name });
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}


async function exitGroup(req, res) {
  try {
    const { id } = req.params;
    const { user_id } = req.user;

    const group = await Group.findById(id); // Usamos await para manejar la promesa

    if (!group) {
      return res.status(404).send({ msg: "Grupo no encontrado" });
    }

    const newParticipants = group.participants.filter(
      (participant) => participant.toString() !== user_id
    );

    const newData = {
      ...group._doc,
      participants: newParticipants,
    };

    await Group.findByIdAndUpdate(id, newData); // Usamos await para la actualización

    res.status(200).send({ msg: "Salida exitosa" });
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
}

async function addParticipants(req, res) {
  try {
    const { id } = req.params;
    const { users_id } = req.body;

    // Buscar el grupo por ID
    const group = await Group.findById(id);
    
    // Verificar si el grupo existe
    if (!group) {
      return res.status(404).send({ msg: "Grupo no encontrado" });
    }

    // Buscar los usuarios por sus IDs
    const users = await User.find({ _id: { $in: users_id } });

    console.log(users_id);

    // Crear un array de ObjectIds de los usuarios
    const arrayObjectIds = users.map(user => user._id);

    // Actualizar los participantes del grupo
    const newData = {
      participants: [...group.participants, ...arrayObjectIds],
    };

    // Actualizar el grupo
    await Group.findByIdAndUpdate(id, newData, { new: true });

    res.status(200).send({ msg: "Participantes añadidos correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ msg: "Error al añadir participantes" });
  }
}


async function banParticipant(req, res) {
  const { group_id, user_id } = req.body;

  const group = await Group.findById(group_id);

  const newParticipants = group.participants.filter(
    (participant) => participant.toString() !== user_id
  );

  const newData = {
    ...group._doc,
    participants: newParticipants,
  };

  await Group.findByIdAndUpdate(group_id, newData);

  res.status(200).send({ msg: "Expulsion con existo" });
}

export const GroupController = {
  create,
  getAll,
  getGroup,
  updateGroup,
  exitGroup,
  addParticipants,
  banParticipant,
};
