import { Request, Response } from 'express';
import { env } from '../../config/env';
import { AuthService } from './auth.service';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.validation';
import { sendSuccess, sendError } from '../../utils/apiResponse';
import { setTokenCookies, clearTokenCookies, verifyRefreshToken } from '../../utils/jwt';
import { comparePassword, hashToken, compareToken, hashPassword } from '../../utils/password';
import { generateRandomToken } from '../../utils/token';
import { sendPasswordResetEmail } from '../../utils/email';
import { User } from '../../models/User';

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid request data', 422, parsed.error.format());
      return;
    }

    const existingUser = await AuthService.findUserByEmail(parsed.data.email);
    if (existingUser) {
      sendError(res, 'CONFLICT', 'Email already in use', 409);
      return;
    }

    const { user, verificationToken } = await AuthService.createUser(parsed.data);

    // Simulate Email sending (MVP rule)
    console.log(`\n\n[DEV EMAIL SIMULATION] Verification Link for ${user.email}:`);
    console.log(`${env.CLIENT_URL}/verify-email?token=${verificationToken}&id=${user._id}\n\n`);

    sendSuccess(res, {
      message: 'User registered successfully. Check console for verification link (simulation).',
    }, 201);
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid request data', 422, parsed.error.format());
      return;
    }

    const user = await AuthService.findUserByEmail(parsed.data.email);
    if (!user) {
      sendError(res, 'UNAUTHORIZED', 'Invalid email or password', 401);
      return;
    }

    const isMatch = await comparePassword(parsed.data.password, user.passwordHash);
    if (!isMatch) {
      sendError(res, 'UNAUTHORIZED', 'Invalid email or password', 401);
      return;
    }

    const { accessToken, refreshToken } = await AuthService.generateAuthTokens(user);
    setTokenCookies(res, accessToken, refreshToken);

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await AuthService.clearRefreshToken(decoded.id);
      } catch (e) {
        // Ignore invalid token on logout
      }
    }
    clearTokenCookies(res);
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      sendError(res, 'UNAUTHENTICATED', 'No refresh token provided', 401);
      return;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (e) {
      clearTokenCookies(res);
      sendError(res, 'UNAUTHENTICATED', 'Invalid or expired refresh token', 401);
      return;
    }

    const user = await AuthService.findUserById(decoded.id);
    if (!user || !user.refreshTokenHash) {
      clearTokenCookies(res);
      sendError(res, 'UNAUTHENTICATED', 'Invalid refresh token session', 401);
      return;
    }

    const isMatch = await compareToken(token, user.refreshTokenHash);
    if (!isMatch) {
      clearTokenCookies(res);
      sendError(res, 'UNAUTHENTICATED', 'Invalid refresh token session', 401);
      return;
    }

    const { accessToken, refreshToken } = await AuthService.generateAuthTokens(user);
    setTokenCookies(res, accessToken, refreshToken);

    sendSuccess(res, { message: 'Tokens rotated successfully' });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'UNAUTHENTICATED', 'Not authenticated', 401);
      return;
    }

    const user = await AuthService.findUserById(req.user.id);
    if (!user) {
      sendError(res, 'NOT_FOUND', 'User not found', 404);
      return;
    }

    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, id } = req.query;
    if (!token || !id || typeof token !== 'string' || typeof id !== 'string') {
      sendError(res, 'BAD_REQUEST', 'Missing token or user ID', 400);
      return;
    }

    const user = await AuthService.findUserById(id);
    if (!user || !user.emailVerificationTokenHash) {
      sendError(res, 'BAD_REQUEST', 'Invalid verification request', 400);
      return;
    }

    if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt < new Date()) {
      sendError(res, 'BAD_REQUEST', 'Verification token expired', 400);
      return;
    }

    const isMatch = await compareToken(token, user.emailVerificationTokenHash);
    if (!isMatch) {
      sendError(res, 'BAD_REQUEST', 'Invalid verification token', 400);
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    sendSuccess(res, { message: 'Email successfully verified' });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid request data', 422, parsed.error.format());
      return;
    }

    const user = await AuthService.findUserByEmail(parsed.data.email);
    // Generic response regardless of whether email exists
    if (!user) {
      sendSuccess(res, { message: 'If an account exists with this email, a reset link has been logged.' });
      return;
    }

    const resetToken = generateRandomToken();
    const resetTokenHash = await hashToken(resetToken);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour

    user.passwordResetTokenHash = resetTokenHash;
    user.passwordResetExpiresAt = expires;
    await user.save();

    const resetLink = `${env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`;
    await sendPasswordResetEmail(user.email, resetLink);

    sendSuccess(res, { message: 'If an account exists with this email, a reset link has been logged.' });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      sendError(res, 'BAD_REQUEST', 'Missing user ID', 400);
      return;
    }

    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError(res, 'VALIDATION_ERROR', 'Invalid request data', 422, parsed.error.format());
      return;
    }

    const user = await AuthService.findUserById(id);
    if (!user || !user.passwordResetTokenHash) {
      sendError(res, 'BAD_REQUEST', 'Invalid reset request', 400);
      return;
    }

    if (user.passwordResetExpiresAt && user.passwordResetExpiresAt < new Date()) {
      sendError(res, 'BAD_REQUEST', 'Reset token expired', 400);
      return;
    }

    const isMatch = await compareToken(parsed.data.token, user.passwordResetTokenHash);
    if (!isMatch) {
      sendError(res, 'BAD_REQUEST', 'Invalid reset token', 400);
      return;
    }

    const newHash = await hashPassword(parsed.data.password);
    user.passwordHash = newHash;
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    
    // Optionally invalidate refresh sessions
    user.refreshTokenHash = null;

    await user.save();

    sendSuccess(res, { message: 'Password has been successfully reset' });
  } catch (err: any) {
    sendError(res, 'SERVER_ERROR', err.message, 500);
  }
};
