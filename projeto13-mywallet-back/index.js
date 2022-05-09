import express from 'express';
import cors from 'cors';
import chalk from 'chalk';
import { MongoClient } from "mongodb";
import joi from 'joi';
import {v4 as uuid} from "uuid";
import bcrypt from "bcrypt";
//my
const app = express();
app.use(cors())
app.use(express.json())
const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;
const conexao = mongoClient.connect()
app.post("/cadastro", async (req, res) => {
    const cadastro = req.body;
  const cadastroSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().required(),
    confirmarSenha:joi.string().required()
    
  });
  const {error} = cadastroSchema.validate(cadastro, {abortEarly: false});
  if(error || cadastro.senha !== cadastro.confirmarSenha) {
    res.status(422).send(error.details.map(detail => detail.message));
    return;
  }

  try {
    cadastro.valor={
      valorMais:{},
      valorMenos:{},
      valorTotal:0
    }
    const usuario = await db.collection("cadastro").insertOne({...cadastro, senha: bcrypt.hashSync(cadastro.senha, 10)});
    console.log("usuario criado", usuario);
    res.sendStatus(201);
  } catch(e) {
    res.sendStatus(500);
    console.log("Erro ao registrar", e);
  }
});
const a={batata:'oi'}
app.get("/cadastro",  (req, res) => {
    res.send(a);

});
app.post("/login", async (req, res) => {
  const login = req.body;
  const loginSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().required()
  });

  const {error} = loginSchema.validate(login, {abortEarly: false});
  if(error) {
    res.status(422).send(error.details.map(detail => detail.message));
    return;
  }

  try {
    const usuario = await db.collection("cadastro").findOne({email: login.email});
    if(usuario && bcrypt.compareSync(login.senha, usuario.senha)) { 
      const token = uuid();
      await db.collection("sessoes").insertOne({ token, usuarioId: usuario._id });
      res.status(200).send(token);
    }
    else res.sendStatus(404);
  } catch(e) {
    res.sendStatus(500);
    console.log("Erro ao registrar", e);
  }

});
app.get("/objetos", async (req, res) => {
  const authorization = req.headers.authorization;
  console.log("authorization", authorization);

  const token = authorization?.replace("Bearer", "").trim();

  if(!token) {
    console.log("erro 1")
    res.sendStatus(401);
    return;
  }

  console.log("token", token);
  const sessao = await db.collection("sessoes").findOne({token});
  if(!sessao) {
    console.log("erro 2")
    res.status(401).send(authorization);
    return;
  }

  const usuario = await db.collection("cadastro").findOne({_id: new ObjectId(sessao.usuarioId)});
  if(!usuario) {
    console.log("erro 3")
    res.sendStatus(401);
    return;
  } else {
    delete usuario.senha;
    res.send(usuario);
  }
});






conexao.then(()=>{
    db = mongoClient.db("mywallet");
    console.log('teoricamente')

})




app.listen(5000,() =>{
    console.log(chalk.bold.green('funcionando!'))
})
/*
const app = express();
app.use(cors())
app.use(express.json())
const mongoClient = new MongoClient("mongodb://localhost:27017");
let db;
const conexao = mongoClient.connect()
app.post("/cadastro", async (req, res) => {
    const cadastro = req.body;
  const cadastroSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().required(),
    senha: joi.string().required(),
    confirmarSenha:joi.string().required()
    
  });
  if(error ||cadastro.senha !== cadastro.confirmarSenha) {
    res.status(422).send(error.details.map(detail => detail.message));
    return;
  }

  try {
    const usuario = await db.collection("cadastro").insertOne({...cadastro, senha: bcrypt.hashSync(cadastro.senha, 10)});
    console.log("usuario criado", usuario);
    res.sendStatus(201);
  } catch(e) {
    res.sendStatus(500);
    console.log("Erro ao registrar", e);
  }
});
app.get("/cadastro",  (req, res) => {
    res.send('oi');
    
conexao.then(()=>{
    db = mongoClient.db("mywallet");
    console.log('teoricamente')

})


});

 */