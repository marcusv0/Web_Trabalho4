require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
// Importações de Segurança
const helmet = require('helmet');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');

const app = express();
const userController = require('./controllers/userController');
const authController = require('./controllers/authController');
const isAuth = require('./middleware/auth');

// --- CONFIGURAÇÕES DE SEGURANÇA E MIDDLEWARES ---

// Protege os headers HTTP (Ex: XSS, Sniffing) - Essencial rodar primeiro
app.use(helmet()); 

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));

// Configuração da Sessão do Usuário
app.use(session({
    secret: process.env.SESSION_SECRET || 'chave-secreta-desenvolvimento',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Nota: Em produção com HTTPS, mudar para true
}));

// Proteção contra CSRF (Cross-Site Request Forgery)
const csrfProtection = csrf();
app.use(csrfProtection);

// Middleware Global: Injeta o token CSRF em todas as respostas para as views
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Proteção contra Força Bruta (Rate Limiting) na rota de login
const limiterAuth = rateLimit({
    windowMs: 60 * 1000, // Janela de 1 minuto
    max: 5, // Bloqueia após 5 tentativas erradas
    message: "Muitas tentativas detectadas. Aguarde 1 minuto antes de tentar novamente."
});

// Conexão com o Banco de Dados (MongoDB)
mongoose.connect(process.env.DB_CONNECTION_STRING)
    .then(() => console.log('Base de dados conectada com sucesso!'))
    .catch(erro => console.error('Falha na conexão com Mongo:', erro));

// --- DEFINIÇÃO DE ROTAS ---

// Rotas de Autenticação
app.get('/login', (req, res) => {
    res.render('login', { erro: req.query.erro, sucesso: req.query.sucesso });
});

// Aplica o Rate Limit apenas no POST do login
app.post('/login', limiterAuth, authController.login);
app.get('/logout', authController.logout);

// Rotas de Cadastro Público
app.get('/register', authController.getRegisterForm);
app.post('/register', authController.registerUser);

// Rotas Protegidas (Exigem Login)
app.get('/', (req, res) => res.redirect('/users'));

// CRUD de Usuários
app.get('/users', isAuth, userController.getAllUsers);
app.get('/users/new', isAuth, userController.getNewUserForm);
app.post('/users/delete/:id', isAuth, userController.deleteUser);
app.get('/users/edit/:id', isAuth, userController.getEditUserForm);
app.post('/users/update/:id', isAuth, userController.updateUser);

app.listen(3000, () => console.log('Aplicação ativa na porta 3000'));