
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import styles from "./styles.module.css";
import Swal from "sweetalert2";

const Forgot = () => {
  const navigate = useNavigate();
  const [Email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  //otp verification

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = `http://localhost:7000/v1/user/forget-password`;
      const { data } = await axios.post(url, { Email });
      if (data.status === "success") {
        //sweet alert to get otp from user
        const { value: userotp } = await Swal.fire({
          title: "Enter your OTP",
          input: "text",
          inputLabel: "Inout your OTP",
          // inputValue: inputValue,
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) {
              return "Please Enter Your Otp to proceed further";
            }
          },
        });
        console.log(userotp);
        // if user give otp , checking otp by integrating backend api
        if (userotp) {
          const verifyotp = async () => {
            const otp = userotp;
            const getotp = await axios.post(
              `http://localhost:7000/v1/user/otp-verification/${Email}`,
              {
                otp: otp,
              }
            );
            console.log(getotp);
            console.log(getotp.data.status);
            //if otp is verfied , navigating to reset password page else showing error/ failure message to user
            if (getotp.data.status === "success") {
              navigate("/reset-password", { state: { Email: Email } });
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: getotp.data.message,
                showCloseButton: true,
              });
            }
            // setCmt(getcmt.data.result);
          };
          verifyotp();
        }
        //showing failure msg using swal
      } else if (data.status === "failure") {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.message,
          showCloseButton: true,
        });
      }
      console.log(data);
      console.log(data.message);
      console.log(data.status);

      // setMsg(data.message);
    } catch (error) {
      console.log(error.response);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response.message,
        showCloseButton: true,
      });
    }
  };
  //onSubmit={handleSubmit}
  return (
    //UI to get email from user
    <>
      <div className="container my-5 ">
        <div className=" col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3 p-5 border border-3 border-info rounded-3">
          <h2 h2 className="text-center">
            Forgot password
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="emailid" className="form-label">
                Enter Registered Email here:
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your registered Email"
                name="Email"
                onChange={(e) => setEmail(e.target.value)}
                value={Email}
                required
              />
            </div>
            <div className="text-center ">
              <button
                type="submit"
                className="btn btn-outline-info w-100 btnstyle"
              >
                Send otp
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default Forgot;
