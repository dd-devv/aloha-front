import { User } from "./user.interfaces";

export interface LoginResponse {
  success: boolean;
  message: string;
  data:    DataLogin;
}

export interface DataLogin {
  user:  User;
  token: string;
}

export interface GetUsersResponse {
  success: boolean;
  message: string;
  data:    User[];
}
