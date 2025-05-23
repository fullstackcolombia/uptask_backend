import type { Request, Response } from "express";
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
  noteId: Types.ObjectId;
};

export class NoteController {
  static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
    const { content } = req.body;
    console.log(req.body);
    try {
      const o = new Note(req.body);
      o.content = content;
      o.createdBy = req.user.id;
      o.task = req.task.id;
      req.task.notes.push(o.id);
      await Promise.allSettled([o.save(), req.task.save()]);
      res.send("Nota creada correctamente");
    } catch (error) {
      console.log(error);
    }
  };

  static getTaskNotes = async (req: Request, res: Response) => {
    try {
      const o_all = await Note.find({ task: req.task.id }).populate(
        "createdBy"
      );
      res.json(o_all);
    } catch (error) {
      console.log(error);
    }
  };

  static deleteNote = async (req: Request, res: Response) => {
    try {
      const { noteId } = req.params;
      const o = await Note.findById(noteId);
      if (!o) {
        const error = new Error("Nota no encontrado");
        return res.status(404).json({ error: error.message });
      }
      if (o.createdBy.toString() !== req.user.id.toString()) {
        const error = new Error("Acción no válida");
        return res.status(404).json({ error: error.message });
      }
      req.task.notes = req.task.notes.filter(
        (note) => note.toString() !== noteId.toString()
      );
      await Promise.allSettled([o.deleteOne(), req.task.save()]);
      res.send("Nota eliminada correctamente");
    } catch (error) {
      console.log(error);
    }
  };
}
