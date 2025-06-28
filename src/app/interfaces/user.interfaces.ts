export interface User {
  _id:       string;
  nombres:   string;
  sueldo:   number;
  apellidos: string;
  username:  string;
  role:      string;
  deleted:   boolean;
  createdAt: Date;
}
