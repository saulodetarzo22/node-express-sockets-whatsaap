import { User } from '../models/index.js'
import { getFilePath } from '../utils/index.js'
import { Group } from '../models/group.js'
 
const getMe = async (req, res) => {
 
  const { user_id } = req.user
 
  const response = await User.findById(user_id).select(['-password'])
 
  try {
    if (!response) {
      res.status(400).send({ message: 'No se ha encontrado el usuario' })
    } else {
      res.status(200).send(response)
    }
  } catch (error) {
    res.status(500).send({ message: 'Error en el servidor' })
  }
 
}
 
const getUsers = async (req, res) => {
 
  const { user_id } = req.user
  const users = await User.find({ _id: { $ne: user_id } }).select(['-password'])
 
  try {
    if (!users) {
      res.status(400).send({ message: 'No se ha encontrado el usuarios' })
    } else {
      res.status(200).send(users)
    }
  } catch (error) {
    res.status(500).send({ message: 'Error en el servidor' })
  }
 
}
 
const getUser = async (req, res) => {
 
  const { id } = req.params
 
  const response = await User.findById(id).select(['-password'])
 
  try {
    if (!response) {
      res.status(400).send({ message: 'No se ha encontrado el usuario' })
    } else {
      res.status(200).send(response)
    }
  } catch (error) {
    res.status(500).send({ message: 'Error en el servidor' })
  }
}
 
const updateUser = async (req, res) => {
 
  const { user_id } = req.user
  const userData = req.body
 
  if (req.files.avatar) {
    const imagePath = getFilePath(req.files.avatar)
    userData.avatar = imagePath
  }
 
  User.findByIdAndUpdate({ _id: user_id }, userData).then(updatedUser => {
    res.status(200).send(updatedUser)
  }).catch((error) => {
    res.status(400).send({
      message: 'Error al actualizar el usuario'
    })
  });
}
 

async function getUsersExeptParticipantsGroup(req, res) {
  const { group_id } = req.params;

  const group = await Group.findById(group_id);
  const participantsStrings = group.participants.toString();
  const participants = participantsStrings.split(",");

  const response = await User.find({ _id: { $nin: participants } }).select(["-password",]);

  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado ningun usuario" });
  } else {
    res.status(200).send(response);
  }
}

export const UserController = {
  getMe,
  getUsers,
  getUser,
  updateUser,
  getUsersExeptParticipantsGroup,
};
