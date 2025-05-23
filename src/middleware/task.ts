import type { Request, Response, NextFunction } from "express";
import Task, { ITask } from "../models/Task";

declare global {
  namespace Express {
    interface Request {
      task: ITask;
    }
  }
}

export const taskExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { taskId } = req.params;
    const o_task = await Task.findById(taskId);
    if (!o_task) {
      const error = new Error("Tarea no encontrada");
      return res.status(404).json({ error: error.message });
    }
    req.task = o_task;
    next();
  } catch (error) {
    return res.status(500).json({ errors: "Hubo un error" });
  }
};

export const taskBelongsToProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.task.project.toString() !== req.project.id.toString()) {
      const error = new Error("Acción no válida");
      return res.status(404).json({ error: error.message });
    }
    next();
  } catch (error) {
    return res.status(500).json({ errors: "Hubo un error" });
  }
};

export const hasAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.user.id.toString() !== req.project.manager.toString()) {
      const error = new Error("Acción no válida");
      return res.status(404).json({ error: error.message });
    }
    next();
  } catch (error) {
    return res.status(500).json({ errors: "Hubo un error" });
  }
};
