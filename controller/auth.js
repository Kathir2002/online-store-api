const { toTitleCase, validateEmail } = require("../config/function");
const bcrypt = require("bcryptjs");
const userModel = require("../models/users");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const nodemailer = require('nodemailer')
require("dotenv").config();

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rmscottageindustry@gmail.com",
    pass: process.env.EMAIL_PASS
  }
})
let EmailData;
class Auth {
  async isAdmin(req, res) {
    let { loggedInUserId } = req.body;
    try {
      let loggedInUserRole = await userModel.findById(loggedInUserId);
      console.log(loggedInUserRole, "loggedInUserRole");

      res.json({ role: loggedInUserRole.userRole });
    } catch {
      res.status(404);
    }
  }

  async allUser(req, res) {
    try {
      let allUser = await userModel.find({});
      console.log(allUser);
      res.json({ users: allUser });
    } catch {
      res.status(404);
    }
  }

  /* User Registration/Signup controller  */
  async postSignup(req, res) {
    let { name, email, password, cPassword } = req.body;
    let myPass = password
    let error = {};
    if (!name || !email || !password || !cPassword) {
      error = {
        ...error,
        name: "Filed must not be empty",
        email: "Filed must not be empty",
        password: "Filed must not be empty",
        cPassword: "Filed must not be empty",
      };
      return res.json({ error });
    }
    if (name.length < 3 || name.length > 25) {
      error = { ...error, name: "Name must be 3-25 charecter" };
      return res.json({ error });
    } else {
      if (validateEmail(email)) {
        name = toTitleCase(name);
        if ((password.length > 255) | (password.length < 8)) {
          error = {
            ...error,
            password: "Password must be 8 charecter",
            name: "",
            email: "",
          };
          return res.json({ error });
        } else {
          // If Email & Number exists in Database then:
          try {
            password = bcrypt.hashSync(password, 10);
            const data = await userModel.findOne({ email: email });
            if (data) {
              error = {
                ...error,
                password: "",
                name: "",
                email: "Email already exists",
              };
              return res.json({ error });
            } else {
              let newUser = new userModel({
                name,
                email,
                password,
                userRole: 0,
              });
              newUser
                .save()
                .then((data) => {
                  let mailOptions = {
                    from: "rmscottageindustry@gmail.com",
                    to: email,
                    subject: "Your Registration Success",
                    html: `<!DOCTYPE html>
                    <html>
                    
                    <head>
                        <meta charset="UTF-8">
                        <title>Registration Successful</title>
                        <style type="text/css">
                            /* CSS styles for the email template */
                            body {
                                font-family: Arial, sans-serif;
                                font-size: 16px;
                                line-height: 1.5;
                                color: #333;
                                background-color: #f7f7f7;
                                padding: 30px 0;
                            }
                    
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                padding: 40px;
                                background-color: #fff;
                                border-radius: 10px;
                                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                            }
                    
                            h1 {
                                font-size: 32px;
                                color: #007bff;
                                margin-top: 0;
                                margin-bottom: 20px;
                                text-align: center;
                                text-transform: uppercase;
                                letter-spacing: 2px;
                            }
                    
                            p {
                                margin-top: 0;
                                margin-bottom: 20px;
                                text-align: justify;
                                line-height: 1.8;
                            }
                    
                            .button {
                                display: inline-block;
                                padding: 15px 30px;
                                background-color: #007bff;
                                margin-left: 12rem;
                                margin-top: 2rem;
                                color: #fff;
                                text-decoration: none;
                                border-radius: 5px;
                                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                                transition: background-color 0.2s ease;
                            }
                    
                            .button:hover {
                                background-color: #0062cc;
                                color: white;
                            }
                    
                            .details {
                                margin-top: 30px;
                                padding: 20px;
                                background-color: #f5f5f5;
                                border-radius: 5px;
                                border: 1px solid #ccc;
                            }
                    
                            .details p {
                                margin-top: 0;
                                margin-bottom: 10px;
                            }
                    
                            .footer {
                                margin-top: 40px;
                                padding-top: 20px;
                                border-top: 1px solid #ccc;
                                font-size: 14px;
                                color: #666;
                            }
                        </style>
                    </head>
                    
                    <body>
                        <div class="container">
                            <h1>Registration Successful</h1>
                            <p>Thank you for registering with our site. Your account has been successfully created.</p>
                            <p>Please use the following credentials to log in to your account:</p>
                            <div class="details">
                                <p><strong>Name:</strong> ${name}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Password:</strong> ${myPass}</p>
                            </div>
                            <a href="https://rms-cottage.onrender.com/" class="button">Log in to your account</a>
                        </div>
                        <div class="footer">
                            <p>If you have any questions or concerns, please don't hesitate to <a href="mailto:maanmark@gmail.com">maanmark@gmail.com</a> call us at 9487257490.</p>
                            <p>You received this email because you recently registered on our website. </p>
                            <p>If you did not register, please call us at 9487257490 and mail us <a href="mailto:maanmark@gmail.com">maanmark@gmail.com</a>.</p>
                        </div>
                    </body>
                    
                    </html>`
                  }
                  mailTransporter.sendMail(mailOptions, err => {
                    if (err) {
                      console.log(err);
                    }
                    else {
                      console.log("Email has sent");
                    }
                  })
                  return res.json({
                    success: "Account create successfully. Please login",
                  });
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          } catch (err) {
            console.log(err);
          }
        }
      } else {
        error = {
          ...error,
          password: "",
          name: "",
          email: "Email is not valid",
        };
        return res.json({ error });
      }
    }
  }

  /* User Login/Signin controller  */
  async postSignin(req, res) {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        error: "Fields must not be empty",
      });
    }
    try {
      const data = await userModel.findOne({ email: email });
      EmailData = data
      if (!data) {
        return res.json({
          error: "Invalid email or password",
        });
      } else {
        const login = await bcrypt.compare(password, data.password);
        if (login) {
          const token = jwt.sign(
            { _id: data._id, role: data.userRole },
            JWT_SECRET
          );
          const encode = jwt.verify(token, JWT_SECRET);
          return res.json({
            token: token,
            user: encode,
          });
        } else {
          return res.json({
            error: "Invalid email or password",
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
}

const authController = new Auth();
module.exports = authController;

