import type { Request, Response, NextFunction } from "express";
import Project, { IProject } from "../models/Project";

declare global {
  namespace Express {
    interface Request {
      project: IProject;
    }
  }
}

export const projectExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const o_project = await Project.findById(projectId);
    if (!o_project) {
      const error = new Error("Proyecto no encontrado");
      return res.status(404).json({ error: error.message });
    }
    req.project = o_project;
    next();
  } catch (error) {
    return res.status(500).json({ errors: "Hubo un error" });
  }
};
