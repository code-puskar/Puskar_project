import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const hashToken = async (token: string) => {
  return bcrypt.hash(token, 10);
};

export const compareToken = async (token: string, hash: string) => {
  return bcrypt.compare(token, hash);
};
