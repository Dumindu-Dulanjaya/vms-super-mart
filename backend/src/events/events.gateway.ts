import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`WebSocket client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`WebSocket client disconnected: ${client.id}`);
  }

  emitNewOrder(order: any) {
    if (this.server) {
      this.server.emit('order:new', order);
    }
  }

  emitOrderStatusUpdate(data: { orderId: string; status: string }) {
    if (this.server) {
      this.server.emit('order:status-update', data);
    }
  }
}
