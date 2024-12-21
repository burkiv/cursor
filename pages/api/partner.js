import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
  }

  if (req.method === 'GET') {
    try {
      // Şimdilik sahte veriler döndürüyoruz
      // Gerçek uygulamada bu veriler veritabanından gelecek
      return res.status(200).json({
        partner: null,
        relationshipInfo: {
          startDate: null,
          duration: '0 gün',
          totalMessages: 0,
          sharedActivities: 0,
          albums: 0,
          photos: 0
        }
      });
    } catch (error) {
      console.error('Partner bilgileri alınırken hata:', error);
      return res.status(500).json({ error: 'Partner bilgileri alınamadı' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 