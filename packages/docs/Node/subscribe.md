# subscribe

_Subscribe to server-sent events (SSE) for a given subscription ID._

## Endpoint

`/v1/CHAIN/NETWORK/subscribe/:id`

## Example

### Request

```shell
curl -N http://localhost:1031/v1/LTC/regtest/subscribe/12345
```

### Response

This endpoint uses Server-Sent Events (SSE). The response is a continuous stream of events sent from the server.

- The connection stays open until the client closes it or the server shuts it down.

- Every 30 seconds, the server sends a heartbeat message to keep the connection alive.

- When an event relevant to the given subscription id occurs, it is sent in the following format:

```
data: {"event":"some-event","payload":{ ... }}
```

Example heartbeat (every 30s):

```
data:
```

#### Closing the connection

The stream closes automatically if the client disconnects. The server will then remove the subscription associated with the given id.
