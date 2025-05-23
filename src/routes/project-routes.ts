import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleinputsErrors } from "../middleware/validations";
import { TaskController } from "../controllers/TaskController";
import { projectExists } from "../middleware/project";
import {
  hasAuthorization,
  taskBelongsToProject,
  taskExists,
} from "../middleware/task";
import { authenticate } from "../middleware/auth";
import { TeamController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteController";

const router = Router();

router.use((req, res, next) => {
  authenticate(req, res, next);
});

router.post(
  "/",
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es requerido"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es requerido"),
  body("description")
    .notEmpty()
    .withMessage("La descrición del proyecto es requerido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await ProjectController.createProject(req, res);
  }
);

router.get("/", async (req, res) => {
  await ProjectController.getAllProjects(req, res);
});

router.get(
  "/:id",
  param("id").isMongoId().withMessage("ID no válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await ProjectController.getProjectById(req, res);
  }
);

//Routes for tasks
router.param("projectId", (req, res, next) => {
  projectExists(req, res, next);
});

router.put(
  "/:projectId",
  param("projectId").isMongoId().withMessage("ID no válido"),
  body("projectName")
    .notEmpty()
    .withMessage("El nombre del proyecto es requerido"),
  body("clientName")
    .notEmpty()
    .withMessage("El nombre del cliente es requerido"),
  body("description")
    .notEmpty()
    .withMessage("La descrición del proyecto es requerido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await hasAuthorization(req, res, next);
  },
  async (req, res) => {
    await ProjectController.updateProject(req, res);
  }
);

router.delete(
  "/:projectId",
  param("projectId").isMongoId().withMessage("ID no válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await hasAuthorization(req, res, next);
  },
  async (req, res) => {
    await ProjectController.deleteProject(req, res);
  }
);

//Routes for tasks

router.post(
  "/:projectId/tasks",
  (req, res, next) => {
    hasAuthorization(req, res, next);
  },
  body("name").notEmpty().withMessage("El nombre de la tarea es requerido"),
  body("description")
    .notEmpty()
    .withMessage("La descrición de la tarea es requerido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await TaskController.createTask(req, res);
  }
);

router.get("/:projectId/tasks", async (req, res) => {
  await TaskController.getAllTasks(req, res);
});

router.param("taskId", (req, res, next) => {
  taskExists(req, res, next);
});
router.param("taskId", (req, res, next) => {
  taskBelongsToProject(req, res, next);
});

router.get(
  "/:projectId/tasks/:taskId",
  param("taskId").isMongoId().withMessage("ID no válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await TaskController.getTaskById(req, res);
  }
);

router.put(
  "/:projectId/tasks/:taskId",
  (req, res, next) => {
    hasAuthorization(req, res, next);
  },
  param("taskId").isMongoId().withMessage("ID no válido"),
  body("name").notEmpty().withMessage("El nombre de la tarea es requerido"),
  body("description")
    .notEmpty()
    .withMessage("La descrición de la tarea es requerido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await TaskController.updateTask(req, res);
  }
);

router.delete(
  "/:projectId/tasks/:taskId",
  (req, res, next) => {
    hasAuthorization(req, res, next);
  },
  param("taskId").isMongoId().withMessage("ID no válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await TaskController.deleteTask(req, res);
  }
);

router.post(
  "/:projectId/tasks/:taskId/status",
  param("taskId").isMongoId().withMessage("ID no válido"),
  body("status").notEmpty().withMessage("El estado de la tarea es requerido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await TaskController.updateStatus(req, res);
  }
);

router.post(
  "/:projectId/team/find",
  body("email").isEmail().toLowerCase().withMessage("E-mail no válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await TeamController.findMemberByEmail(req, res);
  }
);

router.post(
  "/:projectId/team",
  body("id").isMongoId().withMessage("ID no válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await TeamController.addMemberById(req, res);
  }
);

router.get("/:projectId/team", async (req, res) => {
  await TeamController.getProjectTeam(req, res);
});

router.delete(
  "/:projectId/team/:userId",
  param("userId").isMongoId().withMessage("ID no válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await TeamController.removeMemberById(req, res);
  }
);

/** Routes for Notes */
router.post(
  "/:projectId/tasks/:taskId/notes",
  body("content").notEmpty().withMessage("El contenido es obligatorio"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await NoteController.createNote(req, res);
  }
);
router.get("/:projectId/tasks/:taskId/notes", async (req, res) => {
  await NoteController.getTaskNotes(req, res);
});
router.delete(
  "/:projectId/tasks/:taskId/notes/:noteId",
  param("noteId").isMongoId().withMessage("ID no válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res) => {
    await NoteController.deleteNote(req, res);
  }
);

export default router;
