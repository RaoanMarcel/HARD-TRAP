import express from "express";
import client from "prom-client";

const app = express();
const PORT = process.env.PORT || 3000;

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const counter = new client.Counter({
  name: "node_request_operations_total",
  help: "O total de requisições processadas",
});

app.get("/health", (req, res) => {
  counter.inc();
  res.send("prometheus+grafana+kubernetes");
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});