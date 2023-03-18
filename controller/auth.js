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
                      <style>
                        body {
                          font-family: Arial, sans-serif;
                          font-size: 16px;
                          color: #444444;
                        }
                        .container {
                          max-width: 600px;
                          margin: 0 auto;
                          padding: 20px;
                          background-color: #f9f9f9;
                          border: 1px solid #dddddd;
                        }
                        h1, h2, h3, h4, h5, h6 {
                          color: #444444;
                          margin: 0;
                          line-height: 1.2;
                        }
                        p {
                          margin: 0 0 1em 0;
                        }
                        .bold {
                          font-weight: bold;
                        }
                        .footer {
                          margin-top: 40px;
                          text-align: center;
                          color: #888888;
                        }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <h1>Registration Successful</h1>
                        <p>Thank you for registering with us! Your account has been successfully created. Here are your account details:</p>
                    
                        <table>
                          <tbody>
                            <tr>
                              <td>Email:</td>
                              <td class="bold">${email}</td>
                            </tr>
                            <tr>
                              <td>Name::</td>
                              <td class="bold">${name}</td>
                            </tr>
                            <tr>
                              <td>Password:</td>
                              <td class="bold">${myPass}</td>
                            </tr>
                          </tbody>
                        </table>
                    
                        <p>You can now log in to your account at <a target="_blank" href="http://localhost:3000/">http://localhost:3000</a>. If you have any questions or concerns, please contact us at <a href="mailto:maanmark@gmail.com">maanmark@gmail.com</a>.</p>
                      </div>
                    
                      <div class="footer">
                        <p>This email was sent to you by RMS Cottage Industries.</p>
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

// module.exports = EmailData
