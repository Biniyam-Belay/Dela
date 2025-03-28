import bcrypt from 'bcryptjs';

// Hash a password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10); // Generate a salt (10 rounds is generally recommended)
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

// Compare entered password with hashed password from DB
export const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};