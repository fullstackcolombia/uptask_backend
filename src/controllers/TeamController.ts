import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select(
        "_id email name"
      );
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }
      res.json(user);
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ error });
    }
  };

  static addMemberById = async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.body.id).select("_id");
      if (!user) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }
      if (
        req.project.team.some((team) => team.toString() === user.id.toString())
      ) {
        const error = new Error("El usuario ya existe en el proyecto");
        return res.status(409).json({ error: error.message });
      }
      req.project.team.push(user.id);
      await req.project.save();
      res.send("Usuario agregado correctamente");
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static getProjectTeam = async (req: Request, res: Response) => {
    try {
      const project = await Project.findById(req.project.id).populate({
        path: "team",
        select: "id name email",
      });
      res.json(project.team);
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static removeMemberById = async (req: Request, res: Response) => {
    try {
      if (
        !req.project.team.some(
          (team) => team.toString() === req.params.userId.toString()
        )
      ) {
        const error = new Error("El usuario no existe en el proyecto");
        return res.status(404).json({ error: error.message });
      }
      req.project.team = req.project.team.filter(
        (teamMember) => teamMember.toString() !== req.params.userId.toString()
      );
      await req.project.save();
      res.send("Usuario eliminado correctamente");
    } catch (error) {
      return res.status(500).json({ error });
    }
  };
}
