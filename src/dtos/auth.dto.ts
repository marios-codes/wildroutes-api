export const USER_ROLES = ['USER', 'ADMIN'] as const;

export type Role = (typeof USER_ROLES)[number];

export type RegisterUserDto = {
  name: string;
  email: string;
  password: string;
};

export type LoginUserDto = {
  email: string;
  password: string;
};

export type UserResponseDto = {
  id: number;
  name: string;
  email: string;
  role: Role;
};
