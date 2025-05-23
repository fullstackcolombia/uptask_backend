import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  private static tag_controller = "Proyecto";

  static createProject = async (req: Request, res: Response) => {
    try {
      const o = new Project(req.body);
      o.manager = req.user.id;
      await o.save();
      res.send(this.tag_controller + " creado correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const o_all = await Project.find({
        $or: [
          { manager: { $in: req.user.id } },
          { team: { $in: req.user.id } },
        ],
      });
      res.json(o_all);
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static getProjectById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const o = await Project.findById(id).populate("tasks");
      if (!o) {
        const error = new Error(this.tag_controller + " no encontrado");
        return res.status(404).json({ error: error.message });
      }
      if (
        o.manager.toString() !== req.user.id.toString() &&
        !o.team.includes(req.user.id)
      ) {
        const error = new Error("Acción no válida");
        return res.status(404).json({ error: error.message });
      }
      res.json(o);
    } catch (error) {
      console.log(error);
    }
  };

  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.projectName = req.body.projectName;
      req.project.clientName = req.body.clientName;
      req.project.description = req.body.description;
      await req.project.save();
      res.send(this.tag_controller + " actualizado correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  static deleteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne();
      res.send(this.tag_controller + " eliminado correctamente");
    } catch (error) {
      console.log(error);
    }
  };
}
