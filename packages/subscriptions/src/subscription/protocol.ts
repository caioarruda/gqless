export const GQL_CONNECTION_INIT = 'connection_init'; // Client -> Server
export const GQL_CONNECTION_ACK = 'connection_ack'; // Server -> Client
export const GQL_CONNECTION_ERROR = 'connection_error'; // Server -> Client
export const GQL_CONNECTION_KEEP_ALIVE = 'ka'; // Server -> Client

export const GQL_CONNECTION_TERMINATE = 'connection_terminate'; // Client -> Server
export const GQL_START = 'subscribe'; // Client -> Server
export const GQL_DATA = 'next'; // Server -> Client
export const GQL_ERROR = 'error'; // Server -> Client
export const GQL_COMPLETE = 'complete'; // Server -> Client
export const GQL_STOP = 'complete'; // Client -> Server

export const GRAPHQL_WS = 'graphql-ws';
export const GRAPHQL_TS_WS = 'graphql-transport-ws';
