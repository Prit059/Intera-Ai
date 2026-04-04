// utils/websocket.js
class QuizWebSocket {
  constructor() {
    this.socket = null;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(quizId) {
    if (this.socket) this.disconnect();

    this.socket = new WebSocket(`${process.env.REACT_APP_WS_URL}/quiz/${quizId}/leaderboard`);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.notifySubscribers(data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.attemptReconnect(quizId);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  attemptReconnect(quizId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(quizId), 3000 * this.reconnectAttempts);
    }
  }

  subscribe(callback) {
    const id = Date.now();
    this.subscribers.set(id, callback);
    return id;
  }

  unsubscribe(id) {
    this.subscribers.delete(id);
  }

  notifySubscribers(data) {
    this.subscribers.forEach(callback => callback(data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.subscribers.clear();
  }
}

export const quizWebSocket = new QuizWebSocket();