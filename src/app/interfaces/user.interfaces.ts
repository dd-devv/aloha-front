export interface User {
  _id:       string;
  nombres:   string;
  apellidos: string;
  username:  string;
  role:      string;
  deleted:   boolean;
  createdAt: Date;
}
