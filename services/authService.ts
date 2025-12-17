import { User } from '../types';

const DB_KEY = 'ct_auth_users_db';
const TOKEN_KEY = 'ct_auth_jwt';

interface UserRecord {
  id: string;
  username: string;
  passwordHash: string; // Simulated hash
  createdAt: number;
}

interface JWTPayload {
  sub: string; // userId
  username: string;
  iat: number;
  exp: number;
}

// --- Mock Backend Logic ---

/**
 * Simulates generating a signed JWT.
 * Structure: Base64(Header) . Base64(Payload) . Signature
 */
const signToken = (user: User): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: JWTPayload = {
    sub: user.id,
    username: user.username,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hour expiry
  };

  const b64Header = btoa(JSON.stringify(header));
  const b64Payload = btoa(JSON.stringify(payload));
  // In a real app, this is signed with a secret on the server.
  const signature = btoa(`mock_signature_${payload.sub}_${payload.exp}`);

  return `${b64Header}.${b64Payload}.${signature}`;
};

/**
 * Simulates verifying and decoding a JWT.
 */
const verifyToken = (token: string): User | null => {
  try {
    const [head, body, sig] = token.split('.');
    if (!head || !body || !sig) return null;

    const payload: JWTPayload = JSON.parse(atob(body));
    
    // Check expiry
    if (Date.now() > payload.exp) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }

    return {
      id: payload.sub,
      username: payload.username
    };
  } catch (e) {
    return null;
  }
};

/**
 * Simulates a database hash check
 */
const hashPassword = (password: string) => btoa(`salt_${password}`);

// --- Service Implementation ---

export const authService = {
  /**
   * Initialize session from local JWT
   */
  getCurrentUser: (): User | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    return verifyToken(token);
  },

  /**
   * Register a new user
   */
  signup: (username: string, password: string): { user: User | null; error?: string } => {
    const dbRaw = localStorage.getItem(DB_KEY);
    const db: Record<string, UserRecord> = dbRaw ? JSON.parse(dbRaw) : {};

    // Check existing
    const exists = Object.values(db).some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return { user: null, error: 'Username already taken' };
    }

    // Create user
    const newUser: UserRecord = {
      id: crypto.randomUUID(),
      username,
      passwordHash: hashPassword(password),
      createdAt: Date.now()
    };

    // Save to "DB"
    db[newUser.id] = newUser;
    localStorage.setItem(DB_KEY, JSON.stringify(db));

    // Generate Token
    const user: User = { id: newUser.id, username: newUser.username };
    const token = signToken(user);
    localStorage.setItem(TOKEN_KEY, token);

    return { user };
  },

  /**
   * Authenticate user
   */
  login: (username: string, password: string): { user: User | null; error?: string } => {
    const dbRaw = localStorage.getItem(DB_KEY);
    const db: Record<string, UserRecord> = dbRaw ? JSON.parse(dbRaw) : {};

    const record = Object.values(db).find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!record || record.passwordHash !== hashPassword(password)) {
      return { user: null, error: 'Invalid username or password' };
    }

    const user: User = { id: record.id, username: record.username };
    const token = signToken(user);
    localStorage.setItem(TOKEN_KEY, token);

    return { user };
  },

  /**
   * Destroy session
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  }
};