export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  hashedPassword: string;
  profilePicture?: string | null;
  createdAt: string;
}

