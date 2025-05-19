// ES6 version
import Queue from 'bull';

const renderQueue = new Queue('render', {
  redis: {
    host: 'localhost',
    port: 6379
  }
});

export default renderQueue;
