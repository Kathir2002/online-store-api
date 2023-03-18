const orderModel = require("../models/orders");
const nodemailer = require('nodemailer');
require("dotenv").config();
const moment = require("moment")

let sid = process.env.TWILIO_ACCOUNT_SID
let auth_token = process.env.TWILIO_ACCOUNT_AUTH

const twilio =require("twilio")(sid,auth_token)

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
        let pId = allProduct[0].id;
        // let produtDetails = await productModel.findById(pId)

        if (save) {

          twilio.messages.create({
                        from: process.env.TWILIO_ACCOUNT_NUM,
                        to: `+91${phone}`,
                        body: `Hi there!
            
      Thank you for placing your order with us. We are happy to confirm that your order has been received and is currently being processed. Here are the details of your order:
                        
Order Number: ${transactionId}
Order Date: ${moment().format("YYYY-MM-DD HH:mm:ss")}
Product(s): [insert product name(s) and quantity]
Total Amount: ${amount}
Your Address: ${address}
                        
Please note that your order will be shipped within 3 days and you will receive a tracking number once it has been dispatched.
                        
If you have any questions or concerns about your order, please don't hesitate to contact us at 9487257490 and mail us maanmark@gmail.com .
                        
Thank you for choosing us for your purchase!
                        
Best regards,
RMS Cottage Industries`
                    })
                    .then((res) => console.log(`Message sent to ${phone}`))
                    .catch((err) => {
                        console.log(err);
                    })
        
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
                    /* CSS styles for the email */
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
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                    }
            
                    .product p {
                        margin: 0;
                    }
            
                    .product span {
                        font-weight: bold;
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
                            <p><strong>Product Name:</strong> </p>
                            <p><strong>Price:</strong> &#x20b9; ${amount}</p>
                            <p><strong>Quantity:</strong> ${allProduct[0].quantitiy} </p>
                        </div>
                    </div>
                    <div class="customer">
                        <p><strong>Transaction ID:</strong> ${transactionId}</p>
                        <p><strong>Customer Mobile Number:</strong> +91 ${phone}</p>
                        <p><strong>Customer Address:</strong> ${address} </p>
                    </div>
                    <p>If you have any questions or concerns, please don't hesitate to contact us.</p>
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
        let userDetails = await orderModel.findById(oId).populate("user")
        console.log(userDetails.transactionId);

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
                <p>We wanted to update you on the status of your order for [Product Name]. The details are as follows:</p>
                <table>
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Amount</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>${userDetails.transactionId}</td>
                      <td>${userDetails.amount}</td>
                      <td>${userDetails.allProduct[0].quantitiy}</td>
                      <td class="status">${status}</td>
                    </tr>
                  </tbody>
                </table>
                <p>If you have any questions or concerns, please feel free to contact us at [Customer Support Email].</p>
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

