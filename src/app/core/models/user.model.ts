export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterDraft {
  name: string;
  email: string;
  password: string;
}
