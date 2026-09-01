import crypto from 'crypto';export function secureToken(){return crypto.randomBytes(24).toString('base64url')}
