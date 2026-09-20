import { User } from '../../models/User';
import { hashPassword, comparePassword, hashToken, compareToken } from '../../utils/password';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import { generateRandomToken } from '../../utils/token';

export class AuthService {
  static async findUserByEmail(email: string) {
    return User.findOne({ email: email.toLowerCase() });
  }

  static async findUserById(id: string) {
    return User.findById(id);
  }

  static async createUser(data: any) {
    const passwordHash = await hashPassword(data.password);
    
    // Generate verification token
    const verificationToken = generateRandomToken();
    const verificationTokenHash = await hashToken(verificationToken);
    
    // Set expiry to 24 hours
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      emailVerificationTokenHash: verificationTokenHash,
      emailVerificationExpiresAt: verificationExpires,
    });

    return { user, verificationToken };
  }

  static async generateAuthTokens(user: any) {
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    
    const refreshTokenHash = await hashToken(refreshToken);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    return { accessToken, refreshToken };
  }

  static async clearRefreshToken(userId: string) {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }
}
