import type { Request, Response } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { checkPassword, hashPassword } from "../utils/auth";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      //Prevenir duplicados
      const userExists = await User.findOne({ email: req.body.email });
      if (userExists) {
        const error = new Error("El usuario ya está registrado");
        return res.status(409).json({ error: error.message });
      }
      //Crear user
      const o = new User(req.body);

      //Hash password
      o.password = await hashPassword(req.body.password);

      //Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = o.id;

      //Enviar email
      await AuthEmail.sendConfirmationEmail({
        email: o.email,
        name: o.name,
        token: token.token,
      });

      await Promise.allSettled([o.save(), token.save()]);
      res.send("Cuenta creada, revisa tu email para confirmarla");
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no válido");
        return res.status(404).json({ error: error.message });
      }
      const user = await User.findById(tokenExists.user);
      user.confirmed = true;

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("Cuenta confirmada correctamente");
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const o = await User.findOne({ email: req.body.email });
      if (!o) {
        const error = new Error("El correo no está registrado");
        return res.status(404).json({ error: error.message });
      }
      if (!o.confirmed) {
        //Generar el token
        const token = new Token();
        token.token = generateToken();
        token.user = o.id;
        await token.save();

        //Enviar email
        await AuthEmail.sendConfirmationEmail({
          email: o.email,
          name: o.name,
          token: token.token,
        });
        const error = new Error(
          "La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmación"
        );
        return res.status(401).json({ error: error.message });
      }

      //Revisar password
      const isPasswordCorrect = await checkPassword(
        req.body.password,
        o.password
      );
      if (!isPasswordCorrect) {
        const error = new Error("El password no es correcto");
        return res.status(401).json({ error: error.message });
      }

      const tokenJWT = generateJWT({ id: o.id });

      return res.json(tokenJWT);
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      //Saber si existe el usuario
      const o = await User.findOne({ email: req.body.email });
      if (!o) {
        const error = new Error("El usuario no está registrado");
        return res.status(404).json({ error: error.message });
      }
      if (o.confirmed) {
        const error = new Error("El usuario ya está confirmado");
        return res.status(403).json({ error: error.message });
      }
      //Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = o.id;
      await token.save();

      //Enviar email
      await AuthEmail.sendConfirmationEmail({
        email: o.email,
        name: o.name,
        token: token.token,
      });

      res.send("Se ha enviado un nuevo token a su e-mail");
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      //Saber si existe el usuario
      const o = await User.findOne({ email: req.body.email });
      if (!o) {
        const error = new Error("El usuario no está registrado");
        return res.status(404).json({ error: error.message });
      }
      if (o.confirmed) {
        const error = new Error("El usuario ya está confirmado");
        return res.status(403).json({ error: error.message });
      }
      //Generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = o.id;
      await token.save();

      //Enviar email
      await AuthEmail.sendPasswordResetToken({
        email: o.email,
        name: o.name,
        token: token.token,
      });

      res.send("Revise el correo para restablecer la contraseña");
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no válido");
        return res.status(404).json({ error: error.message });
      }
      res.send("Token válido, define tu contraseña");
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        const error = new Error("Token no válido");
        return res.status(404).json({ error: error.message });
      }
      const user = await User.findById(tokenExists.user);
      //Hash password
      user.password = await hashPassword(req.body.password);

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send("Token válido, define tu contraseña");
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static user = async (req: Request, res: Response) => {
    return res.json(req.user);
  };

  static updateProfile = async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;
      const userExists = await User.findOne({ email });
      if (userExists && userExists._id.toString() !== req.user._id.toString()) {
        const error = new Error("El email ya está registrado");
        return res.status(409).json({ error: error.message });
      }
      req.user.name = name;
      req.user.email = email;
      await req.user.save();
      res.send("Perfil actualizado correctamente");
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    try {
      const { current_password, password } = req.body;
      const user = await User.findById(req.user._id);
      //Revisar password
      const isPasswordCorrect = await checkPassword(
        current_password,
        user.password
      );
      if (!isPasswordCorrect) {
        const error = new Error("El password actual no es correcto");
        return res.status(401).json({ error: error.message });
      }
      req.user.password = await hashPassword(password);
      await req.user.save();
      res.send("El password ha sido actualizado correctamente");
    } catch (error) {
      return res.status(500).json({ error });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      const user = await User.findById(req.user._id);
      //Revisar password
      const isPasswordCorrect = await checkPassword(password, user.password);
      if (!isPasswordCorrect) {
        const error = new Error("El password no es correcto");
        return res.status(401).json({ error: error.message });
      }
      res.send("El password es correcto");
    } catch (error) {
      return res.status(500).json({ error });
    }
  };
}
