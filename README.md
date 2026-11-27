# LAB40 – Laboratório de Funcionalidades Web

Projeto-base para avaliação prática de Integração e Entrega Contínua (CI/CD).

## Requisitos
- Node.js 20 ou superior.
- npm.

## Executar localmente
```bash
npm install
npm start
```
Acesse http://localhost:3000. Para desenvolvimento com reinicialização automática: `npm run dev`.

## Endpoints
- `GET /health`: verificação de disponibilidade.
- `GET /api/features`: lista as 40 funcionalidades e seus estados.
- `POST /api/features/:id`: executa uma funcionalidade, recebendo JSON no corpo.

Exemplo:
```bash
curl -X POST http://localhost:3000/api/features/1 -H "Content-Type: application/json" -d '{"valor":200,"percentual":15}'
```

## Estrutura
```text
lab40/
├── public/
├── src/
│   ├── app.js
│   ├── server.js
│   └── features/
├── package.json
└── package-lock.json
```

## Contrato de cada módulo
Cada arquivo `src/features/featureNN.js` exporta `id`, `name`, `description`, `implemented` e `execute(input)`.

1. Implemente `execute(input)`.
2. Valide os dados recebidos.
3. Retorne um objeto serializável em JSON.
4. Trate entradas inválidas lançando `Error` com mensagem clara.
5. Depois de implementar e validar, altere `implemented` para `true`.
6. Não altere o contrato dos outros módulos nem a API central sem autorização.

Enquanto `implemented` for `false`, a API retorna HTTP 501 para aquele módulo.

## Importante
Este repositório é entregue intencionalmente sem testes automatizados, análise estática, workflow de CI, build ou configuração de deploy. O estudante deverá criar e justificar esses elementos durante a avaliação.

O servidor escuta `process.env.PORT` e `0.0.0.0`, e a aplicação não persiste dados em disco.

## Avaliação individual de Eric França

Módulo atribuído: **02, Calculadora de desconto**. Somente
`src/features/feature02.js` foi implementado. A API central, a interface, o registro
de funcionalidades e os outros 39 módulos foram preservados.

Entrada: `{ "preco": 250, "desconto": 10 }`.
Retorno do módulo: `{ "precoFinal": 225 }`.
Na API, esse retorno aparece em `result.precoFinal`.

`preco` deve ser um número finito maior ou igual a zero. `desconto` deve ser um
número finito de 0 a 100, inclusive. Campos ausentes, strings e entradas inválidas
lançam `Error` com mensagem clara; a API responde HTTP 400. A entrada não é alterada.
O cálculo é `preco * (1 - desconto / 100)`. O resultado usa
`Number(valor.toFixed(2))`: arredondamento do JavaScript para duas casas decimais,
mantendo o tipo numérico. Essa política usa a representação binária de `Number`.

### Verificações locais

```powershell
npm ci
npm run format:check
npm run lint
npm test
npm audit --audit-level=high
npm run test:smoke
```

Os testes usam `node:test` e `node:assert/strict`, sem dependências externas.
`test/feature02.test.js` cobre o exemplo do professor, limites, decimais,
arredondamento, tipos, campos ausentes, números não finitos e preservação da entrada.
`test/integration.test.js` verifica o contrato HTTP, o catálogo, os erros e a
continuidade do servidor. O smoke test verifica `/health`, `/api/features` e a
execução da calculadora. Sem `BASE_URL`, ele inicia e fecha seu próprio servidor;
com essa variável, verifica a aplicação no endereço informado.

ESLint e Prettier são dependências somente de desenvolvimento, utilizadas para o
lint e a formatação exigidos no guia. As verificações de estilo se concentram no
módulo atribuído e nos novos testes e arquivos de configuração, preservando os
arquivos originais dos demais módulos. A instalação inicial dessas ferramentas
reportou **0 vulnerabilidades**; a auditoria também faz parte do CI e bloqueia
vulnerabilidades de severidade alta ou crítica.

### Roteiro de testes manuais

Execute `npm start` e abra `http://localhost:3000`.

1. Consulte `/health`: deve retornar HTTP 200 e `status: "ok"`.
2. Na interface, selecione **02, Calculadora de desconto** e execute o exemplo
   `{ "preco": 250, "desconto": 10 }`: HTTP 200 e `result.precoFinal: 225`.
3. Execute `{ "preco": 99, "desconto": 0 }`: preço final 99.
4. Execute `{ "preco": 99, "desconto": 100 }`: preço final 0.
5. Execute `{ "preco": 10.5, "desconto": 10 }`: preço final 9.45.
6. Execute `{ "preco": 10, "desconto": 101 }`: HTTP 400 e mensagem sobre o desconto.
7. Execute `{ "preco": "250", "desconto": 10 }`: HTTP 400 e mensagem sobre o preço.
8. Selecione uma funcionalidade pendente: ela deve continuar retornando HTTP 501.

### Docker

```powershell
docker build --pull -t lab40:feature02 .
docker run -d --name lab40-feature02 -p 3000:3000 lab40:feature02
docker ps --filter name=lab40-feature02
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/features/2 -ContentType 'application/json' -Body '{"preco":250,"desconto":10}'
docker stop lab40-feature02
docker rm lab40-feature02
```

Encerre o servidor local antes de usar a mesma porta com Docker. O `Dockerfile`
segue o guia, com Node.js 22 Alpine, instalação das dependências de produção e
cópia de `src/` e `public/`. O `.dockerignore` exclui dependências locais, Git,
credenciais e arquivos de imagem exportados.

### CI e CD simulado

O arquivo `.github/workflows/ci.yml` é acionado em `push` e `pull_request`.
A sequência é: `npm ci`, formatação, lint, testes, auditoria, smoke test,
build Docker, execução do contêiner com health check e teste da feature 2,
exportação e upload de `lab40-feature02.tar`. As verificações mais rápidas vêm
primeiro; a imagem só é construída após a aprovação dos testes e da auditoria.
Qualquer falha impede as etapas seguintes. O artefato é
`lab40-image-SHA`, com a tag `lab40:feature02-SHA`.

O arquivo `.github/workflows/cd.yml` executa após um CI aprovado de `push` na
`main`. Ele baixa **a mesma imagem testada** naquela execução, confere a tag e
disponibiliza o artefato `lab40-delivery-record`, contendo a imagem `.tar` e
`deployment-record.txt`. O registro identifica repositório, referência, SHA, tag
e execução de CI de origem. É uma entrega simulada, conforme o guia.

Após baixar e extrair o artefato do CD:

```powershell
Get-Content deployment-record.txt
docker load -i lab40-feature02.tar
```

Use a tag registrada para executar a imagem. Os artefatos ficam disponíveis por
sete dias. O fluxo Git utiliza a branch `feature/feature02` e Pull Request para
a `main` deste repositório individual; o merge deve ocorrer após checks aprovados
e a revisão ou autorização orientada pelo professor.
