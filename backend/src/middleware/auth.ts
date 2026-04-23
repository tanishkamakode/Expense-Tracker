import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  console.log(`[${req.method}] ${req.path} - Auth Header received:`, authHeader);

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("No token extracted from header.");
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_example');
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token.' });
  }
};
