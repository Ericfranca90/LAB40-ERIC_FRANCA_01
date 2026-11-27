// Funcionalidade 02: Calculadora de desconto.
// Objetivo: Calcula o preço final após desconto percentual.
// Exemplo de entrada: { preco: 250, desconto: 10 }
// Implemente conforme as regras e critérios do enunciado fornecido pelo professor.

const implemented = true;

// Desenvolva a regra de negócio e valide todos os dados de entrada.
function execute(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("A entrada deve ser um objeto com preço e desconto.");
  }

  const { preco, desconto } = input;
  if (!Number.isFinite(preco) || preco < 0) {
    throw new Error("O preço deve ser um número finito maior ou igual a zero.");
  }
  if (!Number.isFinite(desconto) || desconto < 0 || desconto > 100) {
    throw new Error("O desconto deve ser um número finito entre 0 e 100.");
  }

  const precoFinal = Number((preco * (1 - desconto / 100)).toFixed(2));
  return { precoFinal };
}

// Mantém o contrato de integração utilizado pela API central.
module.exports = {
  id: 2,
  name: "Calculadora de desconto",
  description: "Calcula o preço final após desconto percentual.",
  implemented,
  execute,
};
