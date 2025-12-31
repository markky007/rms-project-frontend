import api from "./api";

export interface User {
  user_id: number;
  username: string;
  role: "admin" | "staff";
  created_at: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  role: "admin" | "staff";
}

export interface UpdateUserData {
  username?: string;
  password?: string;
  role?: "admin" | "staff";
}

const userService = {
  // Get all users
  getUsers: async (): Promise<User[]> => {
    const response = await api.get("/users");
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await api.post("/users", data);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Login
  login: async (
    username: string,
    password: string
  ): Promise<{ token: string; user: User }> => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },
};

export default userService;
