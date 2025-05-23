import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleinputsErrors } from "../middleware/validations";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post(
  "/create-account",
  body("name").notEmpty().withMessage("El nombre es requerido"),
  body("password")
    .notEmpty()
    .withMessage("El password es requerido")
    .isLength({ min: 8 })
    .withMessage("El password debe tener como mínimo 8 caracteres"),
  body("password_confirmation")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Los password no son iguales");
      }
      return true;
    })
    .withMessage("El password no coincide con la confirmación"),
  body("email")
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("El email no es válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await AuthController.createAccount(req, res);
  }
);

router.post(
  "/confirm-account",
  body("token").notEmpty().withMessage("El token es requerido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await AuthController.confirmAccount(req, res);
  }
);

router.post(
  "/login",
  body("email")
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("El password es requerido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await AuthController.login(req, res);
  }
);

router.post(
  "/request-code",
  body("email")
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("El email no es válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await AuthController.requestConfirmationCode(req, res);
  }
);

router.post(
  "/forgot-password",
  body("email")
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("El email no es válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await AuthController.forgotPassword(req, res);
  }
);

router.post(
  "/validate-token",
  body("token").notEmpty().withMessage("El token es requerido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await AuthController.validateToken(req, res);
  }
);

router.post(
  "/update-password/:token",
  param("token").isNumeric().withMessage("El token no es válido"),
  body("password")
    .notEmpty()
    .withMessage("El password es requerido")
    .isLength({ min: 8 })
    .withMessage("El password debe tener como mínimo 8 caracteres"),
  body("password_confirmation")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Los password no son iguales");
      }
      return true;
    })
    .withMessage("El password no coincide con la confirmación"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await AuthController.updatePasswordWithToken(req, res);
  }
);

router.get(
  "/user",
  (req, res, next) => {
    authenticate(req, res, next);
  },
  async (req, res, next) => {
    await AuthController.user(req, res);
  }
);
/**Profile */
router.put(
  "/profile",
  (req, res, next) => {
    authenticate(req, res, next);
  },
  body("name").notEmpty().withMessage("El nombre es requerido"),
  body("email").isEmail().withMessage("El email no es válido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await AuthController.updateProfile(req, res);
  }
);

router.post(
  "/update-password",
  (req, res, next) => {
    authenticate(req, res, next);
  },
  body("current_password")
    .notEmpty()
    .withMessage("El password actual es requerido"),
  body("password")
    .notEmpty()
    .withMessage("El password es requerido")
    .isLength({ min: 8 })
    .withMessage("El password debe tener como mínimo 8 caracteres"),
  body("password_confirmation")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Los password no son iguales");
      }
      return true;
    })
    .withMessage("El password no coincide con la confirmación"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await AuthController.updateCurrentUserPassword(req, res);
  }
);

router.post(
  "/check-password",
  (req, res, next) => {
    authenticate(req, res, next);
  },
  body("password").notEmpty().withMessage("El password es requerido"),
  (req, res, next) => {
    handleinputsErrors(req, res, next);
  },
  async (req, res, next) => {
    await AuthController.checkPassword(req, res);
  }
);

export default router;
