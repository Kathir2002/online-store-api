const userModel = require("../models/users")
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer')
require("dotenv").config();

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mailto:rmscottageindustry@gmail.com",
    pass: process.env.EMAIL_PASS
  }
})

class User {
  async getAllUser(req, res) {
    try {
      let Users = await userModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      if (Users) {
        return res.json({ Users });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getSingleUser(req, res) {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let User = await userModel
          .findById(uId)
          .select("name email phoneNumber userImage updatedAt createdAt");
        if (User) {
          return res.json({ User });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postAddUser(req, res) {
    let { allProduct, user, amount, transactionId, address, phone } = req.body;
    if (
      !allProduct ||
      !user ||
      !amount ||
      !transactionId ||
      !address ||
      !phone
    ) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let newUser = new userModel({
          allProduct,
          user,
          amount,
          transactionId,
          address,
          phone,
        });
        let save = await newUser.save();
        if (save) {
          return res.json({ success: "User created successfully" });
        }
      } catch (err) {
        return res.json({ error: error });
      }
    }
  }

  async postEditUser(req, res) {
    let { uId, name, phoneNumber } = req.body;
    if (!uId || !name || !phoneNumber) {
      return res.json({ message: "All filled must be required" });
    } else {
      let mailID;
      const email = await userModel.findById(uId, function (err, email) {
        if (err) {
          console.log(err);
        }
        else {
          mailID = email.email
        }
      })

      let currentUser = userModel.findByIdAndUpdate(uId, {
        name: name,
        phoneNumber: phoneNumber,
        updatedAt: Date.now(),
      });
      currentUser.exec((err, result) => {
        if (err) console.log(err);
        let mailOptions = {
          from: "rmscottageindustry@gmail.com",
          to: mailID,
          subject: "Your Details Changed",
          html: `<!DOCTYPE html>
          <html>
          
          <head>
              <meta charset="UTF-8">
              <title>Successful Update of User Information</title>
              <style type="text/css">
                  body {
                      font-family: Arial, sans-serif;
                      font-size: 14px;
                      line-height: 1.5;
                      color: #333333;
                  }
          
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      background-color: #f5f5f5;
                      border: 1px solid #cccccc;
                  }
          
                  h1 {
                      margin-top: 0;
                      font-size: 24px;
                      font-weight: bold;
                      color: #333333;
                      text-align: center;
                  }
          
                  p {
                      margin-bottom: 10px;
                      text-align: center;
                  }
          
                  .success-message {
                      color: green;
                      font-weight: bold;
                  }
          
                  .info-list {
                      margin-top: 20px;
                      padding-left: 0;
                      list-style: none;
                      text-align: center;
                  }
          
                  .info-list li {
                      margin-bottom: 10px;
                  }
          
                  .info-list label {
                      display: inline-block;
                      width: 120px;
                      font-weight: bold;
                      color: #333333;
                      text-align: right;
                      margin-right: 10px;
                  }
          
                  .info-list span {
                      color: green;
                      font-weight: bold;
                  }
          
                  .button {
                      display: block;
                      width: 200px;
                      height: 40px;
                      line-height: 40px;
                      margin-left: 12rem;
                      font-size: 16px;
                      font-weight: bold;
                      color: #ffffff;
                      background-color: #007bff;
                      border: none;
                      border-radius: 5px;
                      margin: 20px auto 0;
                      text-align: center;
                      text-decoration: none;
                  }
              </style>
          </head>
          
          <body>
              <div class="container">
                  <h1>Successful Update of User Information</h1>
                  <p class="success-message">Your information has been successfully updated on our website.</p>
                  <p>If you did not make this change, please contact our customer support team immediately.</p>
                  <ul class="info-list">
                      <li><label>Name:</label><span> ${name}</span></li>
                      <li><label>Mobile Number:</label><span>+91 ${phoneNumber}</span></li>
                  </ul>
                  <a href="https://rms-cottage.onrender.com/" class="button">Visit Online Shop</a>
                  <p>please don't hesitate to call us at 9487257490 and mail us <a href="mailto:maanmark@gmail.com">maanmark@gmail.com</a>.<p/>
                  <p>Thank you for using our website!</p>
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
        return res.json({ success: "User updated successfully" });
      });
    }
  }

  async getDeleteUser(req, res) {
    let { oId, status } = req.body;
    if (!oId || !status) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentUser = userModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      currentUser.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "User updated successfully" });
      });
    }
  }

  async changePassword(req, res) {
    let { uId, oldPassword, newPassword } = req.body;
    if (!uId || !oldPassword || !newPassword) {
      return res.json({ message: "All filled must be required" });
    } else {
      const data = await userModel.findOne({ _id: uId });
      if (!data) {
        return res.json({
          error: "Invalid user",
        });
      } else {
        let mailID;
        let uName
        const email = await userModel.findById(uId, function (err, email) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(email.email);
            mailID = email.email
            uName = email.name
          }
        })
        const oldPassCheck = await bcrypt.compare(oldPassword, data.password);
        if (oldPassCheck) {
          let pass = newPassword
          newPassword = bcrypt.hashSync(newPassword, 10);
          let passChange = userModel.findByIdAndUpdate(uId, {
            password: newPassword,
          });
          passChange.exec((err, result) => {
            if (err) console.log(err);
            let mailOptions = {
              from: "rmscottageindustry@gmail.com",
              to: mailID,
              subject: "Your Password Changed",
              html: `<!DOCTYPE html>
              <html>
              
              <head>
                  <title>Password Changed Successfully</title>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                      /* Styles for the email */
                      body {
                          font-family: Arial, sans-serif;
                          background-color: #f5f5f5;
                          color: #333333;
                          line-height: 1.5;
                      }
              
                      .container {
                          max-width: 600px;
                          margin: 0 auto;
                          padding: 20px;
                          background-color: #ffffff;
                      }
              
                      h1 {
                          font-size: 24px;
                          margin-top: 0;
                      }
              
                      p {
                          margin-bottom: 20px;
                      }
              
                      .button {
                          display: inline-block;
                          padding: 10px 20px;
                          background-color: #007bff;
                          margin-left: 12rem;
                          color: #ffffff;
                          border-radius: 5px;
                          text-decoration: none;
                      }
              
                      .button:hover {
                          background-color: #0069d9;
                      }
              
                      /* Styles for the password field */
                      .password-field {
                          display:block;
                          padding: 10px 20px;
                          background-color: #eeeeee;
                          border-radius: 5px;
                          font-family: monospace;
                      }
              
                      /* Media query to make the email responsive */
                      @media only screen and (max-width: 600px) {
                          .container {
                              width: 100%;
                              max-width: 100%;
                          }
                      }
                  </style>
              </head>
              
              <body>
                  <div class="container">
                      <h1>Password Changed Successfully</h1>
                      <p>Hai ${uName}, Your password has been successfully changed on our website. Your new password is:</p>
                      <p class="password-field"><strong>Email</strong> ${mailID} \n </p>
                      <p class="password-field"><strong>New Password</strong> ${pass} \n </p>
                      <a href="https://rms-cottage.onrender.com/" class="button">Go to Website</a>
                      <p>Please remember to keep your password secure and do not share it with anyone. If you did not make this
                      change, please don't hesitate to call us at 9487257490 and mail us <a href="mailto:maanmark@gmail.com">maanmark@gmail.com</a>.</p>
                      <p>Thank you for using our website!</p>
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
            return res.json({ success: "Password updated successfully" });
          });
        } else {
          return res.json({
            error: "Your old password is wrong!!",
          });
        }
      }
    }
  }
}

const ordersController = new User();
module.exports = ordersController;
