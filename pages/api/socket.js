// pages/api/socket.js
import { Server } from 'socket.io';

let users = {}; // Kullanıcı bilgileri: { socketId: { username, partnerId } }
let partners = {}; // Partner eşleşmeleri: { username: partnerUsername }
let pendingInvites = {}; // Bekleyen davetler: { username: [{ from: username }] }
let messages = {}; // Mesajlar: { username: [{ sender, message, timestamp }] }
let rooms = {}; // Oda bilgileri: { roomId: { users: [], roles: {} } }
let relationships = {}; // İlişki bilgileri: { username: { startDate, partnerId } }

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket_io',
      cors: {
        origin: "*"
      }
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      // Kullanıcı bağlandığında
      socket.on('login', ({ username }) => {
        if (!username) return;
        
        users[socket.id] = { username, online: true };
        
        // Bekleyen davetleri kontrol et
        if (pendingInvites[username]) {
          pendingInvites[username].forEach(invite => {
            socket.emit('partnerInvite', { from: invite.from });
          });
        }

        // Partner varsa bilgilendir
        if (partners[username]) {
          const partnerSocket = Object.keys(users).find(
            id => users[id].username === partners[username]
          );
          if (partnerSocket) {
            io.to(partnerSocket).emit('partnerStatus', { online: true });
          }
        }
      });

      // Partner davet sistemi
      socket.on('sendPartnerInvite', ({ username: targetUsername }) => {
        const sender = users[socket.id]?.username;
        if (!sender) {
          socket.emit('partnerInviteResult', {
            success: false,
            message: 'Önce giriş yapmalısınız'
          });
          return;
        }

        // Kullanıcı kendini davet edemez
        if (targetUsername === sender) {
          socket.emit('partnerInviteResult', {
            success: false,
            message: 'Kendinizi partner olarak ekleyemezsiniz'
          });
          return;
        }

        // Kullanıcı zaten bir partnere sahip mi?
        if (partners[sender]) {
          socket.emit('partnerInviteResult', {
            success: false,
            message: 'Zaten bir partneriniz var'
          });
          return;
        }

        // Hedef kullanıcı var mı?
        const targetSocket = Object.keys(users).find(
          id => users[id].username === targetUsername
        );

        // Daveti kaydet
        if (!pendingInvites[targetUsername]) {
          pendingInvites[targetUsername] = [];
        }
        pendingInvites[targetUsername].push({ from: sender });

        // Hedef kullanıcı online ise daveti gönder
        if (targetSocket) {
          io.to(targetSocket).emit('partnerInvite', { from: sender });
        }

        socket.emit('partnerInviteResult', {
          success: true,
          message: 'Davet gönderildi'
        });
      });

      // Partner davetini kabul et
      socket.on('acceptPartnerInvite', ({ from }) => {
        const receiver = users[socket.id]?.username;
        
        if (!receiver || !pendingInvites[receiver]) {
          return;
        }

        // Daveti bul
        const inviteIndex = pendingInvites[receiver].findIndex(invite => invite.from === from);
        if (inviteIndex === -1) return;

        // Partner eşleştirmesini yap
        partners[receiver] = from;
        partners[from] = receiver;

        // İlişki bilgilerini kaydet
        const startDate = new Date();
        relationships[receiver] = {
          startDate,
          partnerId: from
        };
        relationships[from] = {
          startDate,
          partnerId: receiver
        };

        // Daveti kaldır
        pendingInvites[receiver].splice(inviteIndex, 1);
        if (pendingInvites[receiver].length === 0) {
          delete pendingInvites[receiver];
        }

        // Her iki tarafa da bilgi ver
        const senderSocket = Object.keys(users).find(
          id => users[id].username === from
        );

        if (senderSocket) {
          io.to(senderSocket).emit('partnerInfo', {
            username: receiver,
            online: true
          });
        }

        socket.emit('partnerInfo', {
          username: from,
          online: !!senderSocket
        });
      });

      // Partner davetini reddet
      socket.on('rejectPartnerInvite', ({ from }) => {
        const receiver = users[socket.id]?.username;
        
        if (!receiver || !pendingInvites[receiver]) return;

        // Daveti bul ve kaldır
        const inviteIndex = pendingInvites[receiver].findIndex(invite => invite.from === from);
        if (inviteIndex === -1) return;

        pendingInvites[receiver].splice(inviteIndex, 1);
        if (pendingInvites[receiver].length === 0) {
          delete pendingInvites[receiver];
        }

        // Gönderene bilgi ver
        const senderSocket = Object.keys(users).find(
          id => users[id].username === from
        );
        if (senderSocket) {
          io.to(senderSocket).emit('partnerInviteResult', {
            success: false,
            message: 'Davetiniz reddedildi'
          });
        }
      });

      // Mesajlaşma sistemi
      socket.on('sendPartnerMessage', ({ message }) => {
        const sender = users[socket.id]?.username;
        if (!sender || !partners[sender]) return;

        const partner = partners[sender];
        const newMessage = {
          sender: 'me',
          message,
          timestamp: new Date()
        };

        // Mesajları kaydet
        if (!messages[sender]) messages[sender] = [];
        if (!messages[partner]) messages[partner] = [];

        messages[sender].push(newMessage);
        messages[partner].push({
          ...newMessage,
          sender: 'partner'
        });

        // Gönderene mesajı göster
        socket.emit('newMessage', newMessage);

        // Partner'a mesajı gönder
        const partnerSocket = Object.keys(users).find(
          id => users[id].username === partner
        );
        if (partnerSocket) {
          io.to(partnerSocket).emit('newMessage', {
            sender: 'partner',
            message,
            timestamp: new Date()
          });
        }
      });

      // Partner bilgisi ve mesajları getir
      socket.on('getPartner', () => {
        const username = users[socket.id]?.username;
        if (!username || !partners[username]) return;

        const partner = partners[username];
        const partnerSocket = Object.keys(users).find(
          id => users[id].username === partner
        );

        socket.emit('partnerInfo', {
          username: partner,
          online: partnerSocket ? users[partnerSocket].online : false
        });
      });

      socket.on('getPartnerMessages', () => {
        const username = users[socket.id]?.username;
        if (username && messages[username]) {
          socket.emit('partnerMessages', messages[username]);
        }
      });

      // İlişki bilgilerini getir
      socket.on('getRelationshipInfo', () => {
        const username = users[socket.id]?.username;
        if (!username || !relationships[username]) return;

        const relationship = relationships[username];
        const startDate = new Date(relationship.startDate);
        const now = new Date();
        const diffTime = Math.abs(now - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const relationshipInfo = {
          startDate: startDate,
          duration: `${diffDays} gün`,
          sharedActivities: 0,
          totalMessages: messages[username]?.length || 0
        };

        socket.emit('relationshipInfo', relationshipInfo);
      });

      // İlişki başlangıç tarihini güncelle
      socket.on('updateRelationshipDate', ({ startDate }) => {
        const username = users[socket.id]?.username;
        if (!username || !partners[username]) return;

        const partnerId = partners[username];
        console.log('Updating relationship date:', { username, partnerId, startDate });

        const newStartDate = new Date(startDate);

        // İlişki başlangıç tarihini güncelle
        if (!relationships[username]) {
          relationships[username] = {
            startDate: newStartDate,
            partnerId
          };
        } else {
          relationships[username].startDate = newStartDate;
        }
        
        // Partner'ın da ilişki başlangıç tarihini güncelle
        if (!relationships[partnerId]) {
          relationships[partnerId] = {
            startDate: newStartDate,
            partnerId: username
          };
        } else {
          relationships[partnerId].startDate = newStartDate;
        }

        // Her iki tarafa da güncel bilgileri gönder
        const now = new Date();
        const diffTime = Math.abs(now - newStartDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const relationshipInfo = {
          startDate: newStartDate,
          duration: `${diffDays} gün`,
          sharedActivities: 0,
          totalMessages: messages[username]?.length || 0
        };

        console.log('Sending relationship info:', relationshipInfo);
        socket.emit('relationshipInfo', relationshipInfo);

        // Partner'a da bilgi gönder
        const partnerSocket = Object.keys(users).find(
          id => users[id].username === partnerId
        );
        if (partnerSocket) {
          io.to(partnerSocket).emit('relationshipInfo', {
            ...relationshipInfo,
            totalMessages: messages[partnerId]?.length || 0
          });
        }
      });

      // Bağlantı koptuğunda
      socket.on('disconnect', () => {
        const username = users[socket.id]?.username;
        if (username) {
          if (partners[username]) {
            const partnerSocket = Object.keys(users).find(
              id => users[id].username === partners[username]
            );
            if (partnerSocket) {
              io.to(partnerSocket).emit('partnerStatus', { online: false });
            }
          }
          delete users[socket.id];
        }

        // Odalardan çıkış
        Object.keys(rooms).forEach(roomId => {
          if (rooms[roomId].users.includes(socket.id)) {
            rooms[roomId].users = rooms[roomId].users.filter(userId => userId !== socket.id);
            delete rooms[roomId].roles[socket.id];
            if (rooms[roomId].users.length === 0) {
              delete rooms[roomId];
            }
          }
        });
      });

      // Oda sistemi
      socket.on('joinRoom', (roomId) => {
        // Önceki odadan çık
        Object.keys(rooms).forEach(id => {
          if (rooms[id].users.includes(socket.id)) {
            rooms[id].users = rooms[id].users.filter(userId => userId !== socket.id);
            delete rooms[id].roles[socket.id];
            socket.leave(id);
          }
        });

        // Yeni odaya katıl
        socket.join(roomId);
        if (!rooms[roomId]) {
          rooms[roomId] = {
            users: [],
            roles: {}
          };
        }

        // Kullanıcıyı odaya ekle
        if (!rooms[roomId].users.includes(socket.id)) {
          rooms[roomId].users.push(socket.id);
        }

        // Rol ataması yap
        if (!rooms[roomId].roles[socket.id]) {
          const existingRoles = Object.values(rooms[roomId].roles);
          const role = existingRoles.includes('partner') ? 'user' : 'partner';
          rooms[roomId].roles[socket.id] = role;
          socket.emit('assignedRole', { role });
        } else {
          socket.emit('assignedRole', { role: rooms[roomId].roles[socket.id] });
        }
      });

      socket.on('draw', (data) => {
        socket.to(data.roomId).emit('draw', data);
      });

      socket.on('chatMessage', ({ roomId, message, sender }) => {
        io.to(roomId).emit('chatMessage', { sender, message });
      });
    });
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false
  }
};
