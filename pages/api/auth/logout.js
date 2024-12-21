import { serialize } from 'cookie';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auth cookie'sini sil
  const cookie = serialize('auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1, // Cookie'yi hemen sil
    path: '/'
  });

  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ success: true });
} 