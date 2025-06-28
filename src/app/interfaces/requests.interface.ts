import { User } from "./user.interfaces";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterUserRequest {
  nombres:   string;
  apellidos: string;
  sueldo:    number;
  username:  string;
  password:  string;
  role:      string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data:    User;
}

export interface UpdateUserRequest {
  nombres:   string;
  apellidos: string;
  sueldo:    number;
  role:      string;
}

export interface UpdatePasswordReq {
  userId:      string;
  newPassword: string;
}
