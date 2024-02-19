import {OpenAPIBackend} from 'openapi-backend';
import Handlers from './src/handlers/handlers.js';
import express from 'express';
const headers = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*', 
};



const api = new OpenAPIBackend({ definition: './openapi.yml', quick: true });

// register some handlers
api.register(Handlers);

api.init();
// export async function handler(event, context) {
//   console.log("Request coming here!", JSON.stringify(event));
//   return api.handleRequest(
//     {
//       method: event.httpMethod,
//       path: event.path,
//       query: event.queryStringParameters,
//       body: event.body,
//       headers: event.headers
//     },
//     event,
//     context,
//   );
// }
const app = express();
app.use(express.json());
app.use((req, res) => api.handleRequest(req, req, res));

// start server
app.listen(9000, () => console.info('api listening at http://localhost:9000'));

