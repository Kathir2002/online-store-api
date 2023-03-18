const userModel = require("../models/users")
const bcrypt = require("bcryptjs");
const nodemailer = require('nodemailer')
require("dotenv").config();
// const email = require("./auth")

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
          from: "mailto:rmscottageindustry@gmail.com",
          to: mailID,
          subject: "Your Details Changed",
          html: `<!DOCTYPE html>
          <html>
          
          <head>
              <meta charset="UTF-8">
              <title>User Details Change</title>
              <style>
                  / CSS styles for the email /
                  body {
                      font-family: Arial, sans-serif;
                      background-color: #f4f4f4;
                  }
          
                  .container {
                      max-width: 600px;
                      margin: 0 auto;
                      background-color: #fff;
                      padding: 20px;
                  }
          
                  h1 {
                      font-size: 28px;
                      color: #444;
                      margin-top: 0;
                      text-align: center;
                  }
          
                  p {
                      font-size: 16px;
                      line-height: 1.5;
                      margin-bottom: 20px;
                  }
          
                  .details {
                      margin-top: 30px;
                      padding: 20px;
                      border: 1px solid #ccc;
                      background-color: #f9f9f9;
                  }
          
                  .details p {
                      margin: 0;
                  }
              </style>
          </head>
          
          <body>
              <div class="container">
                  <h1>User Details Changed</h1>
                  <p>Hello,</p>
                  <p>Your personal details have been updated. Please review the changes below:</p>
                  <div class="details">
                      <p><strong>Name:</strong>${name}</p>
                      <p><strong>Mobile Number:</strong> +91 ${phoneNumber}</p>
                  </div>
                  <p>If you did not make these changes, please contact us immediately.</p>
                  <p>Thank you!</p>
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
        const email = await userModel.findById(uId, function (err, email) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(email.email);
            mailID = email.email
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
              from: "mailto:rmscottageindustry@gmail.com",
              to: mailID,
              subject: "Your Password Changed",
              html: `<!DOCTYPE html>
              <html>
              
              <head>
                  <meta charset="UTF-8">
                  <title>Password Change Notification</title>
                  <style>
                      / CSS styles for the email /
                      body {
                          font-family: Arial, sans-serif;
                          background-color: #f4f4f4;
                      }
              
                      .container {
                          max-width: 600px;
                          margin: 0 auto;
                          background-color: #fff;
                          padding: 20px;
                      }
              
                      h1 {
                          font-size: 28px;
                          color: #444;
                          margin-top: 0;
                          text-align: center;
                      }
              
                      p {
                          font-size: 16px;
                          line-height: 1.5;
                          margin-bottom: 20px;
                      }
              
                      .details {
                          margin-top: 30px;
                          padding: 20px;
                          border: 1px solid #ccc;
                          background-color: #f9f9f9;
                      }
              
                      .details p {
                          margin: 0;
                      }
                  </style>
              </head>
              
              <body>
                  <div class="container">
                      <h1>Password Change Notification</h1>
                      <p>Hello,</p>
                      <p>This email is to confirm that your password has been changed.</p>
                      <h3>Your Current Password: ${pass}</h3>
                      <p>If you did not request this change, please contact us immediately.</p>
                      <p>Thank you!</p>
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
