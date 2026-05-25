# Order Notificator

PoC de microsserviços onde um Usuário autenticado cria Pedidos, que disparam Notificações por email.

## Linguagem

### Identidade

**Usuário**:
A pessoa que se cadastra, faz login e cria Pedidos. Possui email, nome e senha. Email e nome do Usuário são os dados usados na Notificação — não existem perfis de negócio separados da identidade de autenticação.
_Evitar_: Cliente, comprador, conta

**Sessão**:
O estado autenticado de um Usuário após login bem-sucedido. Transportada via cookie HTTP gerenciado pelo `auth-service`. Uma Sessão válida é pré-condição para criar um Pedido.
_Evitar_: Token, JWT, credencial

### Pedidos

**Pedido**:
Criado por um Usuário autenticado, com produto e quantidade. A identidade do Usuário (email e nome) é extraída da Sessão — não é fornecida pelo cliente da requisição.
_Evitar_: Compra, transação, ordem

**Evento de Pedido**:
Mensagem publicada no RabbitMQ após a criação de um Pedido. Carrega a identidade do Usuário e os dados do Pedido. Padrão `order:created`.
_Evitar_: Mensagem, payload, job

### Comunicação

**Notificação**:
Email enviado ao Usuário após o `notification-service` consumir um Evento de Pedido. O destinatário é o email do Usuário extraído da Sessão, não um endereço hardcoded.
_Evitar_: Alerta, aviso, mensagem

## Exemplo de diálogo

> **Dev:** Quando o pedido é criado, de onde vem o email do destinatário da notificação?
>
> **Domínio:** Do Usuário autenticado. O `order-service` consulta a Sessão ativa e extrai o email e nome do Usuário. Não é possível criar um Pedido sem uma Sessão válida.
>
> **Dev:** E se o Usuário quiser notificar um email diferente do cadastro?
>
> **Domínio:** Não existe esse conceito aqui. Usuário e destinatário da Notificação são a mesma entidade. Se precisar de destinatários distintos, seria um conceito novo — não é Usuário.
