// pages/api/rooms.js

// Oda verilerini tutacağımız basit bir dizi
let rooms = [];

/**
 * POST /api/rooms
 * Body: { roomName: string }
 * Return: { roomId: string, roomName: string }
 *
 * Yeni bir oda oluşturur, oda adını ve ID’sini rooms dizisine ekler.
 */
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { roomName } = req.body;
    if (!roomName) {
      return res.status(400).json({ error: 'roomName is required' });
    }
    const roomId = Math.random().toString(36).substring(2, 10);
    const newRoom = { roomId, roomName };
    rooms.push(newRoom);
    return res.status(201).json(newRoom);
  } else if (req.method === 'GET') {
    // GET /api/rooms?roomId=xxxx
    const { roomId } = req.query;
    if (!roomId) {
      return res.status(400).json({ error: 'roomId is required' });
    }
    const room = rooms.find(r => r.roomId === roomId);
    if (room) {
      return res.status(200).json(room);
    } else {
      return res.status(404).json({ error: 'Room not found' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
