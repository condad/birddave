export type AuthTokens = {
  id_token: string;
  access_token: string;
  expires_in: number;
};

export type User = {
  name: string;
  email: string;
  validated: boolean;
};

export type Bird = {
  species: string;
  id: string;
  username: string;
};
