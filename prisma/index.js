import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { ObjectId } from "bson";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

// ========== ROTAS ESPECÍFICAS ==========

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
  } catch {
    res.status(500).json({ error: "Erro ao buscar veículos concluídos" });
  }
});

app.get("/api/veiculos/abertos", async (req, res) => {
  try {
    const abertos = await prisma.veiculos.findMany({
      where: { status: "aberto" },
      orderBy: { horaEntrada: "desc" },
    });
    res.json(abertos);
  } catch {
    res.status(500).json({ error: "Erro ao buscar veículos abertos" });
  }
});

app.get("/api/veiculos/resumo-diario", async (req, res) => {
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
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(hoje.getDate() - i);
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

// ========== ROTAS GENÉRICAS ==========

const allowedModels = ["User", "veiculos", "servicos"];

function validarModelo(req, res, next) {
  const { model } = req.params;
  if (!allowedModels.includes(model)) {
    return res.status(404).json({ error: "Modelo não permitido" });
  }
  next();
}

function formatId(id) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

app.get("/api/:model", validarModelo, async (req, res) => {
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

app.post("/api/:model", validarModelo, async (req, res) => {
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

app.put("/api/:model/:id", validarModelo, async (req, res) => {
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

app.delete("/api/:model/:id", validarModelo, async (req, res) => {
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

// ✅ Exporta handler para Vercel
export default app;

