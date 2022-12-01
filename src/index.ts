import fastify from "fastify";
import routes from "./routes";

const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname,reqId,responseTime,req,res",
        messageFormat: "[id={reqId} {req.method} {req.url}] - {msg}",
      },
    },
  },
});

routes(server);

const start = async () => {
  try {
    const port = Number(process.env.PORT || 5001);
    const host = process.env.HOST || "0.0.0.0";
    await server.listen({ port: port, host: host });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
