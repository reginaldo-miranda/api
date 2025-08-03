/*import express, { json } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // <-- Executar a função

app.post("/usuarios", async (req, res) => {
  await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
      age: req.body.age,
    },
  });
  res.status(201).json(req.body);
});

app.get("/usuarios", async (req, res) => {
  // lista todos

  let users = [];

  if (req.query) {
    users = await prisma.user.findMany({
      where: {
        name: req.query.name,
        email: req.query.email,
        age: req.query.age,
      },
    });
  } else {
    users = await prisma.user.findMany();
  }
  res.status(200).json(users);
});

app.put("/usuarios/:id", async (req, res) => {
  // editar um registro

  await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      name: req.body.name,
      email: req.body.email,
      age: req.body.age,
    },
  });
  res.status(201).json(req.body);
});

app.delete("/usuarios/:id", async (req, res) => {
  // deletar um registro
  await prisma.user.delete({
    where: {
      id: req.params.id,
    },
  });
  res.status(200).json({ message: "usuário deletado com sucesso" });
});








//-------------------------- veiculos -----------------------------

app.post("/veiculos", async (req, res) => {
  await prisma.veiculos.create({
    data: {
      placa: req.body.placa,
      marca: req.body.marca,
      cor: req.body.cor,
    },
  });
  res.status(201).json(req.body);
});

app.get("/veiculos", async (req, res) => {
  // lista todos

  let users = [];

  if (req.query) {
    users = await prisma.veiculos.findMany({
      where: {
        marca: req.query.marca,
        modelo: req.query.modelo,
        ano: req.query.ano,
        cor: req.query.cor,
        placa: req.query.placa,
      },
    });
  } else {
    users = await prisma.veiculos.findMany();
  }
  res.status(200).json(users);
});

app.put("/veiculos/:id", async (req, res) => {
  // editar um registro

  await prisma.veiculos.update({
    where: {
      id: req.params.id,
    },
    data: {
      marca: req.body.marca,
      modelo: req.body.modelo,
      ano: req.body.ano,
      cor: req.body.cor,
      placa: req.body.placa,
    },
  });
  res.status(201).json(req.body);
});

app.delete("/veiculos/:id", async (req, res) => {
  // deletar um registro
  await prisma.veiculos.delete({
    where: {
      id: req.params.id,
    },
  });
  res.status(200).json({ message: "Veiculo deletado com sucesso" });
});

app.listen(3000);

// link https://www.youtube.com/watch?v=PyrMT0GA3sE&t=3317s

 esta api esta boa*/

// api generica 
/* esta boa 
import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { ObjectId } from "bson";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

app.use(cors({
  origin: "*", // ou coloque a origem exata do seu frontend para segurança
}));

// Lista branca de modelos permitidos
const allowedModels = ["User", "veiculos", "servicos"];

// Middleware para validar o modelo
function validarModelo(req, res, next) {
  const { model } = req.params;
  if (!allowedModels.includes(model)) {
    return res.status(404).json({ error: "Modelo não permitido" });
  }
  next();
}

// Helper para forçar o id no formato correto
function formatId(id) {
  try {
    return new ObjectId(id);
  } catch (e) {
    return null;
  }
}

// Buscar todos ou por filtros
app.get("/:model", validarModelo, async (req, res) => {
  const { model } = req.params;
  try {
    const results = await prisma[model].findMany({
      where: req.query, // atenção: tudo é string
    });
    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Criar um novo registro
app.post("/:model", validarModelo, async (req, res) => {
  const { model } = req.params;
  try {
    const created = await prisma[model].create({
      data: req.body,
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar por ID
app.put("/:model/:id", validarModelo, async (req, res) => {
  const { model, id } = req.params;
  const objectId = formatId(id);
  if (!objectId) return res.status(400).json({ error: "ID inválido" });

  try {
    const updated = await prisma[model].update({
      where: { id: objectId.toString() },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar por ID
app.delete("/:model/:id", validarModelo, async (req, res) => {
  const { model, id } = req.params;
  const objectId = formatId(id);
  if (!objectId) return res.status(400).json({ error: "ID inválido" });

  try {
    await prisma[model].delete({
      where: { id: objectId.toString() },
    });
    res.json({ message: "Deletado com sucesso" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota específica para listar veículos concluídos e somar o total
app.get("/veiculos/concluidos", async (req, res) => {
  try {
    const concluidos = await prisma.veiculos.findMany({
      where: { 
        status: { 
          in: ["fechado", "concluído"] 
        } 
      },
      orderBy: { horaSaida: "desc" },
    });

    const total = concluidos.reduce((acc, item) => acc + (item.valorPago || 0), 0);

    res.json({ concluidos, total });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar veículos concluídos" });
  }
});


//-------------------------------------------

// Rota para listar veículos abertos
app.get("/veiculos/abertos", async (req, res) => {
  try {
    const abertos = await prisma.veiculos.findMany({
      where: { status: "aberto" },
      orderBy: { horaEntrada: "desc" },
    });

    res.json(abertos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar veículos abertos" });
  }
});



//-----------------------------------------

//----------------------------------------

// Rota para resumo diário (últimos 7 dias)
app.get("/veiculos/resumo-diario", async (req, res) => {
  try {
    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 6); // inclui hoje

    const todos = await prisma.veiculos.findMany({
      where: {
        status: { in: ["fechado", "concluído"] },
        horaSaida: { gte: seteDiasAtras },
      },
    });

    // Agrupa por data
    const resumo = {};

    for (const item of todos) {
      const data = new Date(item.horaSaida).toLocaleDateString("pt-BR");
      resumo[data] = (resumo[data] || 0) + (item.valorPago || 0);
    }

    // Preenche os dias que não têm registros
    const labels = [];
    const dataHoje = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(dataHoje.getDate() - i);
      const label = d.toLocaleDateString("pt-BR");
      labels.push(label);
    }

    const resultadoFinal = labels.map((label) => ({
      data: label,
      total: resumo[label] || 0,
    }));

    res.json(resultadoFinal);
  } catch (error) {
    res.status(500).json({ error: "Erro no resumo diário" });
  }
});



//------------------------------------------



app.listen(3000, () => {
  console.log("API genérica com MongoDB rodando na porta 3000");
});
*/ 

// teste de nova api
import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { ObjectId } from "bson";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

// Rotas específicas: definidas antes das genéricas para evitar conflitos

// GET veículos concluídos
app.get("/api/veiculos/concluidos", async (req, res) => {
  try {
    const concluidos = await prisma.veiculos.findMany({
      where: {
        status: {
          in: ["fechado", "concluído"],
        },
      },
      orderBy: { horaSaida: "desc" },
    });

    const total = concluidos.reduce((acc, item) => acc + (item.valorPago || 0), 0);

    res.json({ concluidos, total });
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar veículos concluídos" });
  }
});

// GET veículos abertos
app.get("/api/veiculos/abertos", async (req, res) => {
  try {
    const abertos = await prisma.veiculos.findMany({
      where: { status: "aberto" },
      orderBy: { horaEntrada: "desc" },
    });
    res.json(abertos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar veículos abertos" });
  }
});

// Resumo diário últimos 7 dias
app.get("/veiculos/resumo-diario", async (req, res) => {
  try {
    const hoje = new Date();
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(hoje.getDate() - 6);

    const todos = await prisma.veiculos.findMany({
      where: {
        status: { in: ["fechado", "concluído"] },
        horaSaida: { gte: seteDiasAtras },
      },
    });

    const resumo = {};
    for (const item of todos) {
      const data = new Date(item.horaSaida).toLocaleDateString("pt-BR");
      resumo[data] = (resumo[data] || 0) + (item.valorPago || 0);
    }

    const labels = [];
    const dataHoje = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(dataHoje.getDate() - i);
      labels.push(d.toLocaleDateString("pt-BR"));
    }

    const resultadoFinal = labels.map((label) => ({
      data: label,
      total: resumo[label] || 0,
    }));

    res.json(resultadoFinal);
  } catch {
    res.status(500).json({ error: "Erro no resumo diário" });
  }
});

// Lista branca de modelos permitidos
const allowedModels = ["User", "veiculos", "servicos"];

// Middleware para validar o modelo
function validarModelo(req, res, next) {
  const { model } = req.params;
  if (!allowedModels.includes(model)) {
    return res.status(404).json({ error: "Modelo não permitido" });
  }
  next();
}

// Função para formatar o id para ObjectId
function formatId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

// Rotas REST genéricas

// Buscar todos ou por filtros
app.get("/:model", validarModelo, async (req, res) => {
  const { model } = req.params;
  try {
    const results = await prisma[model].findMany({
      where: req.query,
    });
    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Criar novo registro
app.post("/:model", validarModelo, async (req, res) => {
  const { model } = req.params;
  try {
    const created = await prisma[model].create({
      data: req.body,
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar por ID
app.put("/:model/:id", validarModelo, async (req, res) => {
  const { model, id } = req.params;
  const objectId = formatId(id);
  if (!objectId) return res.status(400).json({ error: "ID inválido" });

  try {
    const updated = await prisma[model].update({
      where: { id: objectId.toString() },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar por ID
app.delete("/:model/:id", validarModelo, async (req, res) => {
  const { model, id } = req.params;
  const objectId = formatId(id);
  if (!objectId) return res.status(400).json({ error: "ID inválido" });

  try {
    await prisma[model].delete({
      where: { id: objectId.toString() },
    });
    res.json({ message: "Deletado com sucesso" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server na porta da Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
});

export default app;
