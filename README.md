# Contexto

Este projeto é uma PoC para consolidação de conhecimento envolvendo **microsserviços** utilizando `NestJS + RabbitMQ`.

A ideia consiste quando um usuário criar um pedido, ele envia uma mensagem para o microsserviço responsável e então é enviado um e-mail para o usuário que encomendou o pedido.

## Introdução

Aqui vai algumas anotações sobre como funciona a comunicação do `NestJS` com `RabbitMQ` usando comunicação entre serviços baseada em **eventos**

**Este arquivo serve como um caderno de estudos.**

## Anotações

### Corpo da mensagem

Ao fazer uma conexão do **Consumer Service** e o **RabbitMQ**, para que o consumer consiga receber a mensagem, em seu Controller, é necessário um formato específico do corpo da evento.

Mesmo que você faça testes enviando eventos diretamente do broker, você precisaria montar um payload válido para que o `NestJS` validasse seu evento.

O corpo que ele espera é um `JSON` com a seguinte estrutura:

```json
{
  "pattern": "<topic>:<event>",
  "data": {}
}
```

### Serviço de Email

O `NestJS` possui uma biblioteca responsável por adicionar o `nodemailer` nele, então isso facilita um pouco a configuração.
