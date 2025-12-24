const serverless = require('serverless-http');
const app = require('../server');

export default serverless(app);
