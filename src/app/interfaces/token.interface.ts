export interface TokenPayload {
  id:   string;
  role: string;
  iat:  number;
  exp:  number;
}

export enum Roles {
  ADMIN = 'ADMIN',
  MOZO = 'MOZO',
  CHEF = 'CHEF',
  BARMAN = 'BARMAN',
}
