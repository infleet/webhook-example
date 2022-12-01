import { FastifyInstance } from "fastify";
import { Position, Event } from "./types";

enum MessageType {
  position = "position",
  event = "event",
}
export default (server: FastifyInstance) => {
  type BodyPositionPayload = { type: MessageType.position; data: Position };
  type BodyEventPayload = { type: MessageType.event; data: Event };
  type BodyJsonPayload = { type: string; data: Record<string, string> };

  type BodyPayload = BodyPositionPayload | BodyEventPayload | BodyJsonPayload;

  function isPosition(data: BodyPayload): data is BodyPositionPayload {
    return data.type === MessageType.position;
  }

  function isEvent(data: BodyPayload): data is BodyEventPayload {
    return data.type === MessageType.event;
  }

  server.get("/", (_request, _reply) => ({ ok: true }));

  server.post<{ Body: BodyPayload }>("/webhook", async (request, reply) => {
    const [type, token] = (request.headers["authorization"] ?? "").split(" ");

    if (type.toLowerCase() !== "bearer" && token !== process.env.MY_API_TOKEN) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const { body } = request;

    request.log.info('Received a "%s": %j', body?.type, body);
    if (isPosition(body)) {
      const position = body.data;

      request.log.info(
        "Position: [plate=%s] [lat=%j] [lon=%j] [speed=%j] [fix_time:%j] [address=%j]",
        position.vehicle.plate,
        position.latitude,
        position.longitude,
        position.speed,
        position.fix_time,
        position.address
      );
    } else if (isEvent(body)) {
      const event = body.data;

      request.log.info(
        "Event: [plate=%s] [lat=%j] [lon=%j] [speed=%j] [event=%j] [reported_at=%j] [address=%j]",
        event.vehicle.plate,
        event.latitude,
        event.longitude,
        event.attributes.speed,
        event.slug_name,
        event.reported_at,
        event.address
      );
    } else {
      request.log.info(body);
    }

    return reply.code(200).send({ ok: true });
  });
};
