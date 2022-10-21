// "use strict";
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const twillo = require("twilio")(
  "ACbc2e05acfab21e5823802a77fbd2568b",
  "36ef697dac8ded88557c81028892fa0a"
);

const userSchema = require("../models/usermodel");
const comment = require("../models/commentmodel");
const { usertestSchema } = require("../validation/joi");
const { mail_to_customer, sendEmail } = require("../middleware/email");
const PostSchema = require("../models/postmodel");
// const sendEmail = require("../middleware/email");
const Token = require("../models/tokenmodel");
const { Admin, authverify } = require("../middleware/auth");
const { sendotp, verify } = require("../middleware/sms");

router.post("/user-signup", async (req, res) => {
  try {
    // const test = await userte}stSchema.validateAsync(req.body);
    const UserName = req.body.UserName;
    const Email = req.body.Email;
    const Mobilenumber = req.body.Mobilenumber;
    console.log(req.body);
    if (UserName && Email && Mobilenumber) {
      let name = await userSchema.findOne({ UserName: UserName });
      let mailid = await userSchema.findOne({ Email: Email });
      let phonenumber = await userSchema.findOne({
        Mobilenumber: Mobilenumber,
      });
      if (name) {
        return res.json({
          status: "failure",
          message: "username already exist ,try new username",
        });
      } else if (mailid) {
        return res.json({
          status: "failure",
          message: "email already exist ,try new Email",
        });
      } else if (phonenumber) {
        return res.json({
          status: "failure",
          message: "mobileNumber already exist ,try new Mobilenumber",
        });
      }
    } else {
      return res.status(400).json({
        status: "failure",
        message: "Must enter the username , emailid and Mobilenumber",
      });
    }
    const mailData = {
      from: "divya.platosys@gmail.com",
      to: Email,
      subject: "email verification",
      fileName: "verifymail.ejs",
      details: {
        Email: Email,
      },
    };
    let verifymail = mail_to_customer(mailData);
    // const test = await usertestSchema.validateAsync(req.body);
    let userdetail = new userSchema(req.body);
    let password = req.body.password;
    console.log("before hashing:" + password);
    let salt = await bcrypt.genSalt(10);
    userdetail.password = bcrypt.hashSync(password, salt);
    let result = await userdetail.save();
    console.log("after hashing:" + userdetail.password);
    return res.status(200).json({
      status: "success",
      message: "user details are added successfully",
      result: result,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: "failure", message: error.message });
  }
});

//email- verification
router.get("/email-verification/:Email", async (req, res) => {
  try {
    const detail = await userSchema.findOne({ Email: req.params.Email }).exec();
    if (detail) {
      userSchema
        .updateOne(
          { Email: req.params.Email },
          { VerifiedUser: true },
          { new: true }
        )
        .exec();

      return res.status(200).json("account verified successfully");
    } else {
      return res.status(200).json("account verification failed");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: "failure", message: error.message });
  }
});

//login
router.post("/user-login", async (req, res) => {
  try {
    let UserName = req.body.UserName;
    let password = req.body.password;
    let userdetails;
    let finddetails = await userSchema.findOne({ UserName: UserName }).exec();
    if (UserName) {
      userdetails = await userSchema.findOne({ UserName: UserName }).exec();
      if (!userdetails) {
        return res
          .status(400)
          .json({ status: "failure", message: "please signup first" });
      }
    } else {
      return res
        .status(400)
        .json({ status: "failure", message: "Please enter  username" });
    }
    if (userdetails) {
      console.log(userdetails.password);
      let isMatch = await bcrypt.compare(password, userdetails.password);
      if (isMatch) {
        console.log("uuid is", userdetails.uuid);

        let payload = {
          uuid: userdetails.uuid,
          role: userdetails.role,
          _id: userdetails._id,
        };
        const update = await userSchema
          .findOneAndUpdate(
            { uuid: finddetails.uuid },
            { loginStatus: true },
            { new: true }
          )
          .exec();
        console.log("update status", update);
        var Data = update.toObject();
        console.log("dataresult", Data);
        let secrectKey = "processkey_123";
        let jwttoken = jwt.sign(payload, secrectKey);
        Data.jwttoken = jwttoken;

        return res.status(200).json({
          status: "success",
          message: "Logged in successfully",
          data: Data,
        });
      } else {
        return res
          .status(200)
          .json({ status: "failure", message: "Incorrect password" });
      }
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: "failure", message: error.message });
  }
});
//forget-password
//forget-password/:otp
router.post("/forget-password", async (req, res) => {
  try {
    // cheching email entered by user is in db , if user exists send otp or else send error message
    const user = await userSchema.findOne({ Email: req.body.Email });
    //if no user ,give failure message as response
    if (!user) {
      return res.status(409).send({
        status: "failure",
        message: "user with given email doesn't exist",
      });
    } // if user , send otp
    else {
      //calling otp function from sms.js to generate otp
      let userotp = sendotp();
      console.log(userotp);
      //email- subject , text
      const subject = "OTP verification";
      const text = `Your email verification otp is : ${userotp}`;
      //calling email function from email.js to send otp through email
      let email = await sendEmail(req.body.Email, "OTP verification", text);
      // storing generated otp in db
      finduser = await userSchema
        .findOneAndUpdate(
          { Email: req.body.Email },
          { otp: userotp },
          { new: true }
        )
        .exec();
      res.status(200).send({
        status: "success",
        message: "verification otp is send to your email",
      });
    }
  } catch (error) {
    res.send("An error occured, please try again later");
    console.log(error);
  }
});
//otp verification

router.post("/otp-verification/:email", async (req, res) => {
  try {
    const otp = req.body.otp;
    console.log("otp", otp);
    const email = req.params.email;
    //getting user email in params and finding that user in db
    const user = await userSchema.findOne({ Email: email });
    console.log("userotp", user.otp);
    // checking weather entered otp = otp stored in db
    if (user.otp == otp) {
      //and checking valid otp using verify function in sms.js file using otplib check function.
      const verifyotp = verify(otp);
      //if otp matches success res , orelse failure msg.
      if (verifyotp) {
        return res
          .status(200)
          .send({ status: "success", message: "otp veified" });
      } else {
        return res.status(409).send({
          status: "failure",
          message: "otp doesnot match, please try again",
        });
      }
    } else {
      return res
        .status(409)
        .send({ status: "failure", message: "otp doesn't match" });
    }
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
});

// resset password code

router.post("/password-reset/:email", async (req, res) => {
  //getting email in params to check and store new password to corresponding user
  try {
    const user = await userSchema.findOne({ Email: req.params.email });
    if (user) {
      console.log("new password before hashing", req.body.password);
      //hashing new password
      let Salt = await bcrypt.genSalt(10);
      const newpassword = bcrypt.hashSync(req.body.password, Salt);
      console.log(newpassword);
      // saving new password to db
      user.password = newpassword;
      await user.save();
      //success and failure response
      return res
        .status(200)
        .send({ status: "success", message: "password reset sucessfully." });
    } else {
      return res
        .status(200)
        .send({ status: "failure", message: "Something went wrong" });
    }
    // await token.remove();
  } catch (error) {
    res.send("An error occured");
    console.log(error);
  }
});

//logout
router.post("/user-logout", async (req, res) => {
  try {
    const result = await userSchema
      .findOneAndUpdate(
        { uuid: req.query.uuid },
        { loginStatus: false },
        { new: true }
      )
      .exec();
    return res.status(200).json({
      status: "success",
      message: "Logout successfully",
      result: result,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: "failure", message: error.message });
  }
});

//update user

router.put("/update/:_id", async (req, res) => {
  console.log(req.params._id);
  console.log(req.body);
  if (req.body._id === req.params._id) {
    try {
      if (req.body.UserName) {
        const find = await userSchema.findOne({ UserName: req.body.UserName });
        if (!find) {
          const update = await userSchema.findOneAndUpdate(
            { _id: req.params._id },
            {
              $set: req.body,
            },
            { new: true }
          );
          const profile = req.body.profilepic;
          console.log("pic", profile);
          if (profile) {
            const user = await comment.findOne({ Sender: req.params._id });
            if (user) {
              const updateprofile = await comment.findOneAndUpdate(
                { Sender: req.body.__id },
                { user_profile: profile },
                { new: true }
              );
            } else {
              res.send("no comment by the user");
            }
          }
          res.status(200).json({
            status: "success",
            message: "user updated successfully",
            result: update,
          });
        } else {
          res.status(400).json({
            status: "failure",
            message: "UserName already exist",
          });
        }
      } else {
        const user = await userSchema.findOneAndUpdate(
          { _id: req.params._id },
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json({
          status: "success",
          message: "user updated successfully",
          result: user,
        });
      }
    } catch (error) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json("you can only update your account");
  }
});
// $2b$10$bnZFHXDtB1017raZ3c4AXezkgPydW/FFRP.7ImCfEY9M8VJZd4zxa

//delete user
router.delete("/delete-account/:uuid", async (req, res) => {
  try {
    const user = await userSchema.findOne({ uuid: req.params.uuid });
    try {
      await PostSchema.deleteMany({ UserName: user.UserName });
      await userSchema.findOneAndDelete({ uuid: req.params.uuid });
      res.status(200).json({
        status: "success",
        message: "your account has been deleted",
      });
    } catch (error) {
      res.status(500).json(err);
    }
  } catch (error) {
    res.status(500).json("User not found");
  }
});

//get user
router.get("/getuser/:uuid", async (req, res) => {
  try {
    const user = await userSchema.findOne({ uuid: req.params.uuid });
    const { password, ...others } = user._doc;
    return res
      .status(200)
      .json({ status: "success", message: "fetched user", result: others });
  } catch (error) {
    res.status(500).json(error.message);
  }
});
//social signin

router.post("/social-signup", async (req, res) => {
  try {
    let userdetail = new userSchema(req.body);
    let password = req.body.password;
    console.log("before hashing:" + password);
    let salt = await bcrypt.genSalt(10);
    userdetail.password = bcrypt.hashSync(password, salt);
    let result = await userdetail.save();
    console.log("after hashing:" + userdetail.password);
    return res.status(200).json({
      status: "success",
      message: "user details are added successfully",
      result: result,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "failure", error: error.message });
  }
});

//get all user
router.get("/all-user", async (req, res) => {
  try {
    const users = await userSchema.find();
    return res
      .status(200)
      .json({ status: "success", message: "user fetched", result: users });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

router.post("/sms/:", async (req, res) => {
  try {
    twillo.messages
      .create({
        from: "+16012025001",
        to: "+917339080287",
        body: "your reset password otp :",
      })
      .then((mms) => {
        console.log("sms sended");
      })
      .catch((err) => {
        console.log("err", err.message);
      });
  } catch (err) {
    console.log(err.message);
  }
});

//contact us

router.post("/contact", async (req, res) => {
  try {
    console.log(req.body);
    const subject = "User query";
    let email = await sendEmail(req.body.to, subject, req.body.text);
    return res.send({
      status: "success",
      message: "query sent to admin",
      // data: email,
    });
  } catch (error) {
    console.log(error.message);
    return res.send(error.message);
  }
});

module.exports = router;

// router.post("/forget-password", async (req, res) => {
//   try {
//     const user = await userSchema.findOne({ Email: req.body.Email });
//     if (!user) {
//       return res
//         .status(409)
//         .send({ message: "user with given email doesn't exist" });
//     }
//     let token = await Token.findOne({ userId: user._id });
//     if (!token) {
//       token = await new Token({
//         userId: user._id,
//         token: crypto.randomBytes(32).toString("hex"),
//       }).save();
//     }
//     const url = `http://localhost:7000/v1/user/password-reset/${user._id}/${token.token}`;
//     let email = await sendEmail(user.Email, "Password reset", url);
//     res
//       .status(200)
//       .send({ message: "password reset link is sent to your email account" });
//   } catch (error) {
//     res.send("An error occured");
//     console.log(error);
//   }
// });

//verify Url

// router.get("/password-reset/:id/:token", async (req, res) => {
//   try {
//     const user = await userSchema.findOne({ _id: req.params.id });
//     if (!user) {
//       return res.status(400).send({ message: "Invalid Link" });
//     }
//     const token = await Token.findOne({
//       userId: user._id,
//       token: req.params.token,
//     });
//     if (!token) {
//       return res.status(400).send({ message: "Invalid link" });
//     }
//     res.status(200).send({ message: "Valid Url" });
//   } catch (error) {
//     res
//       .status(500)
//       .send({ message: "Internal server Error", error: error.message });
//   }
// });

//reset-password

// router.post("/password-reset/:id/:token", async (req, res) => {
//   try {
//     const user = await userSchema.findOne({ _id: req.params.id });
//     if (!user) return res.status(400).send({ message: "Invalid link" });
//     const token = await Token.findOne({
//       userId: user._id,
//       token: req.params.token,
//     });
//     if (!token) return res.status(400).send({ message: "Invalid link" });
//     // user.password = req.body.password;
//     if (!user.VerifiedUser === true) {
//       user.VerifiedUser = true;
//     }
//     let Salt = await bcrypt.genSalt(10);
//     const newpassword = bcrypt.hashSync(req.body.password, Salt);
//     console.log(newpassword);
//     user.password = newpassword;
//     await user.save();
//     await token.remove();
//     return res.status(200).send({ message: "password reset sucessfully." });
//   } catch (error) {
//     res.send("An error occured");
//     console.log(error);
//   }
// });
