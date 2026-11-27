const test = require("node:test");
const assert = require("node:assert/strict");
const feature = require("../src/features/feature02");

test("calcula o preço com desconto de 10%", () => {
  assert.deepEqual(feature.execute({ preco: 250, desconto: 10 }), {
    precoFinal: 225,
  });
});

test("aceita desconto zero, desconto total e preço zero", () => {
  assert.equal(feature.execute({ preco: 99, desconto: 0 }).precoFinal, 99);
  assert.equal(feature.execute({ preco: 99, desconto: 100 }).precoFinal, 0);
  assert.equal(feature.execute({ preco: 0, desconto: 50 }).precoFinal, 0);
});

test("aceita preço e desconto decimais e arredonda para duas casas", () => {
  assert.equal(feature.execute({ preco: 10.5, desconto: 10 }).precoFinal, 9.45);
  assert.equal(
    feature.execute({ preco: 100, desconto: 12.5 }).precoFinal,
    87.5,
  );
  assert.equal(
    feature.execute({ preco: 19.99, desconto: 15 }).precoFinal,
    16.99,
  );
});

test("rejeita preços e descontos fora dos limites", () => {
  for (const input of [
    { preco: -1, desconto: 10 },
    { preco: 10, desconto: -1 },
    { preco: 10, desconto: 101 },
  ]) {
    assert.throws(() => feature.execute(input), { name: "Error" });
  }
});

test("rejeita campos ausentes, tipos incorretos e números não finitos", () => {
  for (const input of [
    {},
    { preco: 10 },
    { desconto: 10 },
    { preco: "250", desconto: 10 },
    { preco: 250, desconto: "10" },
    { preco: null, desconto: 10 },
    { preco: 250, desconto: false },
    { preco: NaN, desconto: 10 },
    { preco: Infinity, desconto: 10 },
    { preco: 250, desconto: NaN },
    { preco: 250, desconto: Infinity },
  ]) {
    assert.throws(() => feature.execute(input), {
      name: "Error",
      message: /preço|desconto/i,
    });
  }
});

test("rejeita entrada que não seja um objeto", () => {
  for (const input of [undefined, null, [], "texto", 10, true]) {
    assert.throws(() => feature.execute(input), {
      name: "Error",
      message: /objeto/i,
    });
  }
});

test("não modifica a entrada recebida", () => {
  const input = Object.freeze({ preco: 250, desconto: 10 });
  assert.deepEqual(feature.execute(input), { precoFinal: 225 });
  assert.deepEqual(input, { preco: 250, desconto: 10 });
});
