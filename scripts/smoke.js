const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { once } = require("node:events");
const app = require("../src/app");

async function main() {
  let server;
  let baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    server = createServer(app);
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  }

  try {
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.equal((await health.json()).status, "ok");
    console.log("OK /health: HTTP 200, status ok");

    const catalog = await fetch(`${baseUrl}/api/features`);
    assert.equal(catalog.status, 200);
    const features = await catalog.json();
    assert.equal(features.total, 40);
    assert.equal(
      features.items.find((item) => item.id === 2).implemented,
      true,
    );
    console.log("OK /api/features: 40 módulos, feature 2 implementada");

    const response = await fetch(`${baseUrl}/api/features/2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preco: 250, desconto: 10 }),
    });
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.result.precoFinal, 225);
    console.log("OK POST /api/features/2: HTTP 200, precoFinal 225");
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
