import {OpenAPIBackend} from 'openapi-backend';
import Handlers from './src/handlers/handlers.js';
const headers = {
  'content-type': 'application/json',
  'access-control-allow-origin': '*', // lazy cors config
};



// create api from definition
const api = new OpenAPIBackend({ definition: './openapi.yml', quick: true });

// register some handlers
api.register(Handlers);

api.init();

export async function handler(event, context) {
  console.log("Request coming here!", JSON.stringify(event));
  return api.handleRequest(
    {
      method: event.httpMethod,
      path: event.path,
      query: event.queryStringParameters,
      body: event.body,
      headers: event.headers
    },
    event,
    context,
  );
}

