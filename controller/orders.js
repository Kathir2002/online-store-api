const orderModel = require("../models/orders");
const nodemailer = require('nodemailer');
require("dotenv").config();
const moment = require("moment")
const productModel = require("../models/products")
const fast2sms = require("fast-two-sms")

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rmscottageindustry@gmail.com",
    pass: process.env.EMAIL_PASS
  }
})

mailTransporter.verify((err, success) => {
  err
    ? console.log(err)
    : console.log(`=== Server is ready to take messages: ${success} ===`);
});

const ordersController = {
  getAllOrders: async (req, res) => {
    try {
      let Orders = await orderModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      if (Orders) {
        return res.json({ Orders });
      }
    } catch (err) {
      console.log(err);
    }
  },

  getOrderByUser: async (req, res) => {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let Order = await orderModel
          .find({ user: uId })
          .populate("allProduct.id", "pName pImages pPrice")
          .populate("user", "name email")
          .sort({ _id: -1 });
        if (Order) {
          return res.json({ Order });
        }
      } catch (err) {
        console.log(err);
      }
    }
  },

  postCreateOrder: async (req, res) => {

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
        let newOrder = new orderModel({
          allProduct,
          user,
          amount,
          transactionId,
          address,
          phone,
        });
        let save = await newOrder.save();
        let userDetails = await orderModel.findById(save._id).populate("user")
        if (save) {
          let options = {
            authorization: process.env.FAST2MESSAGE_API_KEY,
            numbers: [`${phone}`],
            message: `Thank you for placing order. View details at https://rms-cottage.onrender.com/ .Best regards,RMS Agro`
          }
          fast2sms.sendMessage(options)
            .then((response) => {
              console.log(`Message sent to ${phone}`)
            })
            .catch((err) => {
              console.log(err)
            })

          let arr = []
          let quantitiy1, quantity2, quantitiy3, quantitiy4, pId1, pId2, pId3, pId4, produtDetails1, produtDetails2, produtDetails3, produtDetails4, productName1, productName2, productName3, productName4
          let arrLen = allProduct.length
          if (arrLen == 2) {
            quantity2 = allProduct[1].quantitiy + allProduct[0].quantitiy
            pId1 = allProduct[0].id;
            produtDetails1 = await productModel.findById(pId1)
            pId2 = allProduct[1].id;
            produtDetails2 = await productModel.findById(pId2)
            arr.push(produtDetails1.pName, produtDetails2.pName)
            productName2 = [...arr]
          }
          else if (arrLen == 1) {
            quantitiy1 = allProduct[0].quantitiy
            pId1 = allProduct[0].id;
            produtDetails1 = await productModel.findById(pId1)
            arr.push(produtDetails1.pName)
            productName1 = [...arr]
          }
          else if (arrLen == 3) {
            quantitiy3 = allProduct[1].quantitiy + allProduct[0].quantitiy + allProduct[2].quantitiy
            pId1 = allProduct[0].id;
            produtDetails1 = await productModel.findById(pId1)
            pId2 = allProduct[1].id;
            produtDetails2 = await productModel.findById(pId2)
            pId3 = allProduct[2].id;
            produtDetails3 = await productModel.findById(pId3)
            arr.push(produtDetails1.pName, produtDetails2.pName, produtDetails3.pName)
            productName3 = [...arr]
          }
          else {
            quantitiy4 = allProduct[1].quantitiy + allProduct[0].quantitiy + allProduct[2].quantitiy + allProduct[3].quantitiy
            pId1 = allProduct[0].id;
            produtDetails1 = await productModel.findById(pId1)
            pId2 = allProduct[1].id;
            produtDetails2 = await productModel.findById(pId2)
            pId3 = allProduct[2].id;
            produtDetails3 = await productModel.findById(pId3)
            pId4 = allProduct[3].id;
            produtDetails4 = await productModel.findById(pId4)
            arr.push(produtDetails1.pName, produtDetails2.pName, produtDetails3.pName, produtDetails4.pName)
            productName4 = [...arr]
          }

          let pName1 = arr.join(', ')
          let pName2 = arr.join(', ')
          let pName3 = arr.join(', ')
          let pName4 = arr.join(', ')


          let mailOptions = {
            from: "rmscottageindustry@gmail.com",
            to: userDetails.user.email,
            subject: "Order Confirmed",
            html: `<!DOCTYPE html>
            <html>
            
            <head>
                <meta charset="UTF-8">
                <title>Order Confirmation</title>
                <style>
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
            
                    .product {
                        
                        margin-bottom: 10px;
                    }
            
                    .product p {
                        margin: 0;
                    }
            
                    .product span {
                        font-weight: bold;
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
            
                    .customer {
                        margin-top: 30px;
                        padding: 20px;
                        border: 1px solid #ccc;
                        background-color: #f9f9f9;
                    }
            
                    .customer p {
                        margin: 0;
                    }
            
                    .customer span {
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Order Confirmation</h1>
                    <p>Hello,</p>
                    <p>We wanted to confirm that your order has been successful. Here are the details:</p>
                    <div class="details">
                        <div class="product">
                            <p><strong>Product Name: ${(arrLen == 1 ? pName1 : (arrLen == 2 ? pName2 : (arrLen == 3 ? pName3 : pName4)))}</strong></p>
                            <p><strong>Price:</strong> &#x20b9; ${amount}</p>
                            <p><strong>Quantity:</strong> ${(arrLen == 1 ? quantitiy1 : (arrLen == 2 ? quantity2 : (arrLen == 3 ? quantitiy3 : quantitiy4)))} </p>
                            <p><strong>Transaction ID:</strong> ${transactionId}</p>
                        </div>
                    </div>
                    <div class="customer">
                    <p><strong>Order Date:</strong> ${moment().format("YYYY-MM-DD HH:mm:ss")} </p>
                        <p><strong>Customer Mobile Number:</strong> +91 ${phone}</p>
                        <p><strong>Customer Address:</strong> ${address} </p>
                    </div>
                    <a href="https://rms-cottage.onrender.com/" class="button">Go to Website</a>
                    <p>If you have any questions or concerns, please feel free to contact us at 9487257490 and mail us at <a href="mailto:maanmark@gmail.com">maanmark@gmail.com</a>..</p>
                    <p>Thank you for your business!</p>
                </div>
            </body>
            
            </html>`
          }

          mailTransporter.sendMail(mailOptions, err => {
            if (err) {
              console.log(err);
            }
            else {
              console.log("Email has sent to ", userDetails.user.email);
            }
          })
          return res.json({ success: "Order created successfully" });
        }

      } catch (err) {
        return res.json({ error: err });
      }
    }
  },

  postUpdateOrder: async (req, res) => {
    let { oId, status } = req.body;
    if (!oId || !status) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentOrder = orderModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      try {
        console.log(oId);
        let userDetails = await orderModel.findById(oId).populate("user")
        let orderDetails = await orderModel.findById(oId)
        let pId = orderDetails.allProduct[0].id
        let produtDetails = await productModel.findById(pId)

        currentOrder.exec((err, result) => {
          if (err) console.log(err);
          let mailOptions = {
            from: "rmscottageindustry@gmail.com",
            to: userDetails.user.email,
            subject: "Order Status",
            html: `<!DOCTYPE html>
            <html>
            <head>
              <title>Order Status</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  font-size: 16px;
                  color: #333;
                }
                .container {
                  margin: 20px auto;
                  max-width: 600px;
                  padding: 20px;
                  border: 1px solid #ddd;
                  border-radius: 5px;
                }
                h1 {
                  font-size: 24px;
                  font-weight: bold;
                  margin-top: 0;
                  margin-bottom: 20px;
                  color: #333;
                }
                table {
                  border-collapse: collapse;
                  width: 100%;
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
                th, td {
                  text-align: left;
                  padding: 8px;
                  border-bottom: 1px solid #ddd;
                }
                tr:hover {background-color: #f5f5f5;}
                .status {
                  font-weight: bold;
                  color: green;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Order Status</h1>
                <p>Dear ${userDetails.user.name},</p>
                <p>We wanted to update you on the status of your order. The details are as follows:</p>
                <table>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${userDetails.transactionId}</td>
                      <td>${userDetails.amount}</td>
                      <td class="status">${status}</td>
                    </tr>
                  </tbody>
                </table>
                <a href="https://rms-cottage.onrender.com/user/orders" class="button">Go to Website</a>
                <p>If you have any questions or concerns, please feel free to contact us at 9487257490 and mail us at <a href="mailto:maanmark@gmail.com">maanmark@gmail.com</a>.</p>
                <p>Thank you for your business!</p>
              </div>
            </body>
            </html>
            `
          }


          mailTransporter.sendMail(mailOptions, err => {
            if (err) {
              console.log(err);
            }
            else {
              console.log("Email has sent to ", userDetails.user.email);
            }
          })
          return res.json({ success: "Order updated successfully" });
        });
      }

      catch (err) {
        console.log(err);
      }
    }
  },

  postDeleteOrder: async (req, res) => {
    let { oId } = req.body;
    if (!oId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteOrder = await orderModel.findByIdAndDelete(oId);
        if (deleteOrder) {
          return res.json({ success: "Order deleted successfully" });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

module.exports = ordersController;

