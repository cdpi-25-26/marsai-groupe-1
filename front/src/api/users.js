import instance from "./config.js";

async function getUsers() {
  return await instance.get("users");
  // http://localhost:3000/users; fetch method GET
}

async function createUser(newUser) {
  return await instance.post("users", newUser);
  // http://localhost:3000/users; fetch method POST
}


async function updateUser(id, updatedUser) {
  return await instance.put(`users/${id}`, updatedUser);
  // http://localhost:3000/users/1; fetch method PUT
}

async function deleteUser(id) {
  return await instance.delete(`users/${id}`);
  // http://localhost:3000/users/1; fetch method DELETE
}

async function getUserById(id) {
  return await instance.get(`users/${id}`);
  // http://localhost:3000/users/1; fetch method GET
}

async function getMyProfile() {
  return await instance.get("auth/me");
}

async function updateMyProfile(data) {
  return await instance.patch("auth/me", data);
}

async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  return await instance.post("auth/me/avatar", formData);
}

export { getUsers, createUser, updateUser, deleteUser, getUserById, getMyProfile, updateMyProfile, uploadProfilePicture };
