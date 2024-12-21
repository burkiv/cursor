import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const albums = await prisma.album.findMany({
          where: {
            user: {
              username: session.user.name
            }
          },
          include: {
            _count: {
              select: { photos: true }
            },
            photos: {
              take: 1,
              select: {
                url: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        return res.json(albums);

      case 'POST':
        const { title, description, isPrivate } = req.body;

        if (!title) {
          return res.status(400).json({ error: 'Title is required' });
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username: session.user.name }
          });

          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }

          const newAlbum = await prisma.album.create({
            data: {
              title,
              description,
              isPrivate: isPrivate || false,
              user: {
                connect: {
                  id: user.id
                }
              }
            }
          });

          return res.status(201).json(newAlbum);
        } catch (error) {
          console.error('Album creation error:', error);
          return res.status(500).json({ error: 'Failed to create album' });
        }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Album API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 