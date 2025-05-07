import { User } from "./user.interfaces";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterUserRequest {
  nombres:   string;
  apellidos: string;
  username:  string;
  password:  string;
  role:      string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data:    User;
}
