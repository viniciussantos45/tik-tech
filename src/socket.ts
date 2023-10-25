import { Server } from 'http'
import { Server as SocketServer } from 'socket.io'

let io: SocketServer

export const initializeSocket = (server: Server) => {
  io = new SocketServer(server, {
    cors: {
      origin: '*', // Endereço da sua aplicação frontend
      methods: ['GET', 'POST'],
      allowedHeaders: '*',
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log('Usuário conectado:', socket.id)

    socket.on('disconnect', () => {
      console.log('Usuário desconectado:', socket.id)
    })
  })

  io.listen(4000)

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io não foi inicializado!')
  }
  return io
}
