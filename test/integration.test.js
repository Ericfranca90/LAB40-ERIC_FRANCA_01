const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { once } = require("node:events");
const app = require("../src/app");

test("integra a feature 2 à API sem alterar os demais módulos", async (t) => {
  const server = createServer(app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  await t.test("health check retorna HTTP 200", async () => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      status: "ok",
      application: "LAB40",
    });
  });

  await t.test(
    "catálogo mantém 40 módulos e identifica a feature 2",
    async () => {
      const response = await fetch(`${baseUrl}/api/features`);
      const catalog = await response.json();
      assert.equal(response.status, 200);
      assert.equal(catalog.total, 40);
      assert.equal(catalog.items.length, 40);
      assert.equal(
        catalog.items.find((item) => item.id === 2).implemented,
        true,
      );
      assert.equal(catalog.items.filter((item) => item.implemented).length, 1);
    },
  );

  await t.test(
    "POST válido retorna o preço final no contrato da API",
    async () => {
      const response = await fetch(`${baseUrl}/api/features/2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preco: 250, desconto: 10 }),
      });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        id: 2,
        name: "Calculadora de desconto",
        result: { precoFinal: 225 },
      });
    },
  );

  await t.test(
    "entrada inválida retorna HTTP 400 com mensagem clara",
    async () => {
      for (const input of [{ preco: 10, desconto: 101 }, null, {}]) {
        const response = await fetch(`${baseUrl}/api/features/2`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        assert.equal(response.status, 400);
        assert.match((await response.json()).error, /preço|desconto|objeto/i);
      }
    },
  );

  await t.test(
    "JSON malformado retorna HTTP 400 sem derrubar o servidor",
    async () => {
      const response = await fetch(`${baseUrl}/api/features/2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      });
      assert.equal(response.status, 400);
      assert.match((await response.json()).error, /JSON válido/i);
      assert.equal((await fetch(`${baseUrl}/health`)).status, 200);
    },
  );

  await t.test(
    "módulo não atribuído continua pendente com HTTP 501",
    async () => {
      const response = await fetch(`${baseUrl}/api/features/1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      assert.equal(response.status, 501);
    },
  );
});
