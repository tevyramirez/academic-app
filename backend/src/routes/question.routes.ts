import { Router } from "express";
import  { PreguntaController } from "../controllers/pregunta.controller";

const router = Router();

// GET all preguntas
router.get("/", PreguntaController.getAllPreguntas);

// POST create new pregunta
router.post("/raw", PreguntaController.createPregunta);

export default router;