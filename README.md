# Trabalho 4 - Implementando Defesas Arquiteturais

**Aluno:** Marcus Vinícius
**Matrícula:** 2022007001
**Disciplina:** Arquitetura e Tecnologias de Sistemas WEB

---

## Relatório de Vulnerabilidades Mitigadas

### 1. SQL Injection (SQLi)
* **Defesa:** Uso de Queries Parametrizadas via **Mongoose** (ODM).
* **Onde foi mitigado:**
    * **Controllers:** Nos arquivos `controllers/authController.js` e `controllers/userController.js`.
    * **Implementação:** O Mongoose utiliza abstração de dados e queries parametrizadas por padrão. Ao utilizar métodos como `User.findOne({ email: email })` e `User.create({...})`, a entrada do usuário é tratada estritamente como dado literal, impedindo que comandos SQL injetados alterem a lógica da consulta.

### 2. Cross-Site Scripting (XSS)
* **Defesa:** Output Escaping via Template Engine **EJS**.
* **Onde foi mitigado:**
    * **Views:** Em todas as views que renderizam dados do usuário, especificamente em `views/usersList.ejs` e `views/editUsuario.ejs`.
    * **Implementação:** Utilização exclusiva da sintaxe de escape `<%= variavel %>` (ao invés de `<%- %>`). Isso converte caracteres perigosos (como `<script>`) em entidades HTML seguras antes da renderização no navegador, neutralizando injeções de JavaScript.

### 3. Cross-Site Request Forgery (CSRF)
* **Defesa:** Tokens Anti-CSRF (Sincronizadores) via middleware **csurf**.
* **Onde foi mitigado:**
    * **Servidor (`server.js`):** Configuração global com `app.use(csrfProtection)` e disponibilização do token para as views via `res.locals.csrfToken`.
    * **Formulários (Views):** Injeção do token oculto `<input type="hidden" name="_csrf" value="<%= csrfToken %>">` em todos os formulários POST da aplicação:
        * `views/login.ejs` (Login)
        * `views/register.ejs` (Cadastro)
        * `views/formUsuario.ejs` (Novo Usuário)
        * `views/editUsuario.ejs` (Edição)
        * `views/usersList.ejs` (Exclusão).

### 4. Força Bruta (Brute Force)
* **Defesa:** Rate Limiting via middleware **express-rate-limit**.
* **Onde foi mitigado:**
    * **Servidor (`server.js`):** Definição da constante `loginLimiter` configurada para bloquear IPs após 5 tentativas falhas em 1 minuto.
    * **Rota:** Aplicação direta na rota de login: `app.post('/login', loginLimiter, ... )`.

### 5. Hardening de HTTP Headers
* **Defesa:** Configuração de Headers de Segurança via **Helmet**.
* **Onde foi mitigado:**
    * **Servidor (`server.js`):** Aplicação do middleware `app.use(helmet())` na primeira linha de execução do App Express.
    * **Implementação:** Protege a aplicação configurando headers como `Content-Security-Policy`, `X-Frame-Options` e removendo o header `X-Powered-By`.

### 6. Exposição de Credenciais
* **Defesa:** Variáveis de Ambiente via **dotenv**.
* **Onde foi mitigado:**
    * **Servidor (`server.js`):** As credenciais sensíveis não estão mais no código. O sistema carrega via `require('dotenv').config()` e utiliza `process.env.SESSION_SECRET` e `process.env.DB_CONNECTION_STRING`.
    * **Arquivos:** Criação do arquivo `.env` (listado no `.gitignore` para não ser versionado) contendo os segredos.
    * **Servidor (`server.js`):** As credenciais sensíveis não estão mais no código. O sistema carrega via `require('dotenv').config()` e utiliza `process.env.SESSION_SECRET` e `process.env.DB_CONNECTION_STRING`.
    * **Arquivos:** Criação do arquivo `.env` (listado no `.gitignore` para não ser versionado) contendo os segredos.
