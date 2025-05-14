import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Pregunta } from "../entities/pregunta.entity";
import { CreatePreguntaDto } from "../dto/pregunta.dto";
import { validate } from "class-validator";

// Repository for Pregunta entity
const preguntaRepository = AppDataSource.getRepository(Pregunta);

export class PreguntaController {
  /**
   * Get all preguntas
   */
  static getAllPreguntas = async (req: Request, res: Response): Promise<Response> => {
    try {
      const preguntas = await preguntaRepository.find({
        order: { id: "ASC" }
      });

      return res.status(200).json({
        success: true,
        count: preguntas.length,
        data: preguntas
      });
    } catch (error) {
      console.error("Error fetching preguntas:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while fetching preguntas"
      });
    }
  };

  /**
   * Create a new pregunta
   */
  static createPregunta = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Create DTO from request body
      const preguntaDto = new CreatePreguntaDto();
      preguntaDto.text_content = req.body.text_content;
      preguntaDto.raw_source = req.body.raw_source;

      // Validate DTO
      const errors = await validate(preguntaDto);
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors: errors.map(error => ({
            property: error.property,
            constraints: error.constraints
          }))
        });
      }

      // Create new pregunta entity
      const pregunta = new Pregunta();
      pregunta.text_content = preguntaDto.text_content;
      pregunta.raw_source = preguntaDto.raw_source || null;

      // Save to database
      const savedPregunta = await preguntaRepository.save(pregunta);

      return res.status(201).json({
        success: true,
        data: savedPregunta
      });
    } catch (error) {
      console.error("Error creating question:", error);
      return res.status(500).json({
        success: false,
        error: "Server error while creating question"
      });
    }
  };
}