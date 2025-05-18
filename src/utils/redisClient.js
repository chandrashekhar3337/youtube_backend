import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

await redisClient.connect(); // ES6 + top-level await (Node 18+)

export default redisClient;