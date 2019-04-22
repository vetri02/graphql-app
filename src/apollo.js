import ApolloClient from "apollo-client";
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';

// set your Hausra url
export const HASURA_GRAPHQL_ENGINE_HOSTNAME = 'gql-test-workshop.herokuapp.com';

const scheme = (proto) => {
  return window.location.protocol === 'https:' ? `${proto}s` : proto;
};

const wsurl = `${scheme('ws')}://${HASURA_GRAPHQL_ENGINE_HOSTNAME}/v1alpha1/graphql`;
const httpurl = `${scheme('http')}://${HASURA_GRAPHQL_ENGINE_HOSTNAME}/v1alpha1/graphql`;

// setup websocket link for subscriptions
const wsLink = new WebSocketLink({
  uri: wsurl,
  options: {
    reconnect: true,
  }
});

// setup http link for queries and mutations
const httpLink = new HttpLink({
  uri: httpurl,
});

// create the apollo link, but split traffic based on operation type
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

// initialize the client
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

// export the client
export default client;