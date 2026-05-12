const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

app.use(session({
secret: 'c4security',
resave: false,
saveUninitialized: true
}));

app.use(express.static('./'));
app.use(express.json());

const db = mysql.createConnection({
host:'localhost',
user:'root',
password:'',
database:'c4_security'
});

db.connect((err)=>{
if(err){
console.log('Erro ao conectar banco');
}else{
console.log('Banco conectado com sucesso');
}
});

app.post('/login',(req,res)=>{

const {email, senha} = req.body;

db.query(
'SELECT * FROM usuarios WHERE email=?',
[email],
(err,result)=>{

if(result.length > 0){

let usuario = result[0];

if(bcrypt.compareSync(senha, usuario.senha)){

req.session.logado = true;

res.json({ok:true});

}else{
res.json({ok:false});
}

}else{
res.json({ok:false});
}

});

});

app.get('/chamados',(req,res)=>{

    app.get('/verificar',(req,res)=>{

if(req.session.logado){
res.json({ok:true});
}else{
res.json({ok:false});
}

});


db.query('SELECT * FROM chamados', (err,result)=>{

if(err){
return res.json([]);
}

res.json(result);

});

});

app.get('/logout',(req,res)=>{

req.session.destroy(()=>{
res.json({ok:true});
});

});

app.post('/criar-chamado',(req,res)=>{

const {cliente, email, servico, descricao} = req.body;

db.query(
'INSERT INTO chamados (cliente, email, servico, status, responsavel, descricao) VALUES (?, ?, ?, ?, ?, ?)',
[cliente, email, servico, 'Aberto', 'Equipe C4', descricao],
(err,result)=>{

if(err){
console.log(err);
return res.json({ok:false});
}

res.json({ok:true});

});

});

app.post('/buscar-chamado',(req,res)=>{

const {id, email} = req.body;

db.query(
'SELECT * FROM chamados WHERE id=? AND email=?',
[id, email],
(err,result)=>{

if(err){
return res.json({ok:false});
}

if(result.length > 0){
res.json({ok:true, chamado: result[0]});
}else{
res.json({ok:false});
}

});

});

app.post('/atualizar-status',(req,res)=>{

const {id, status} = req.body;

db.query(
'UPDATE chamados SET status=? WHERE id=?',
[status, id],
(err)=>{

if(err){
return res.json({ok:false});
}

res.json({ok:true});

});

});



app.listen(3000, ()=>{
console.log('Servidor rodando em localhost:3000');
});