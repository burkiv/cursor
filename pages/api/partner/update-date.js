import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
  }

  if (req.method === 'POST') {
    try {
      const { startDate } = req.body;

      if (!startDate) {
        return res.status(400).json({ error: 'Tarih gerekli' });
      }

      // Şimdilik sadece başarılı yanıt döndürüyoruz
      // Gerçek uygulamada bu veri veritabanına kaydedilecek
      return res.status(200).json({
        success: true,
        startDate
      });
    } catch (error) {
      console.error('Tarih güncellenirken hata:', error);
      return res.status(500).json({ error: 'Tarih güncellenirken bir hata oluştu' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 