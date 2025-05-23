import type { Request, Response } from "express";
import Task from "../models/Task";

export class TaskController {
  private static tag_controller = "Tarea";

  static createTask = async (req: Request, res: Response) => {
    try {
      const o = new Task(req.body);
      o.project = req.project.id;
      req.project.tasks.push(o.id);
      await Promise.allSettled([o.save(), req.project.save()]);
      res.send(this.tag_controller + " creada correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  static getAllTasks = async (req: Request, res: Response) => {
    try {
      const o_all = await Task.find({ project: req.project.id }).populate(
        "project"
      );
      res.json(o_all);
    } catch (error) {
      console.log(error);
    }
  };

  static getTaskById = async (req: Request, res: Response) => {
    try {
      const task = await Task.findById(req.task.id)
        .populate({
          path: "completedBy.user",
          select: "id name email",
        })
        .populate({
          path: "notes",
          populate: { path: "completedBy", select: "id name email" },
        });
      res.json(task);
    } catch (error) {
      console.log(error);
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      req.task.name = req.body.name;
      req.task.description = req.body.description;
      await req.task.save();
      res.send(this.tag_controller + " actualizada correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      req.project.tasks = req.project.tasks.filter(
        (task) => task.toString() !== req.task.id
      );
      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
      res.send(this.tag_controller + " eliminada correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    try {
      req.task.status = req.body.status;
      req.task.completedBy.push({ user: req.user.id, status: req.body.status });
      await req.task.save();
      res.send(this.tag_controller + " actualizada correctamente");
    } catch (error) {
      console.log(error);
    }
  };
}
