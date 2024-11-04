export type AuthTokens = {
  id_token: string;
  access_token: string;
  expires_in: number;
};

export type User = {
  sub: string;
  username: string;
  email: string;
  verified: boolean;
};

export type Bird = {
  species: string;
  id: string;
  username: string;
  commonName: string;
  uploadedAt: string;
};
