const axios = require('axios');
const io = require('socket.io-client');
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const BASE_URL = 'http://localhost/auth';
const WS_URL = 'ws://localhost/socket.io';
const NUM_USERS = 50;

async function simulateHttpRequests() {
  console.log('Starting HTTP load test...');
  const promises = [];
  for (let i = 0; i < NUM_USERS; i++) {
    promises.push(
      axios.post(`${BASE_URL}/signup`, {
        email: `user${i*i}@mail.com`,
        password: 'password123'
      }).catch((err) => {
        console.log(err?.response?.data || 'Unknown error');
        console.log('error during signup:', err?.message);
      })
    );
  }
  await Promise.all(promises);
  console.log('HTTP load test completed.');
}

async function simulateWebSocketConnections() {
  console.log('Starting WebSocket load test...');
  const sockets = [];
  for (let i = 0; i < NUM_USERS; i++) {
    const socket = io(WS_URL, { forceNew: true });
    sockets.push(socket);
    socket.on('connect', () => console.log(`Socket ${i} connected`));
    socket.on('statusUpdate', (data) => console.log(`Socket ${i} received:`, data));
  }
  await sleep(5000); // Allow some time for connections and messages
  sockets.forEach((socket, i) => socket.disconnect());
  console.log('WebSocket load test completed.');
}

async function runTests() {
  await simulateHttpRequests();
  await simulateWebSocketConnections();
}

runTests();