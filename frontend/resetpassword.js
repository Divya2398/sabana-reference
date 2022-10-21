import React, { useState, useEffect } from "react";
import axios from "axios";
// import styles from "./styles.module.css";
import { useParams } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";

const Resetpassword = () => {
  const location = useLocation();
   // console.log("location", location);
  // console.log("location", location.state.Email);
  const Email = location.state.Email;

 
  const [password, setPassword] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const change = await axios.post(
      `http://localhost:7000/v1/user/password-reset/${Email}`,
      {
        password: password,
      }
    );
  };
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  //   reset,
  //   trigger,
  // } = useForm();
  return (
    <>
      <div className="container my-5 ">
        <div className=" col-sm-10 offset-sm-1 col-lg-8 offset-lg-2 col-xl-6 offset-xl-3 p-5 border border-3 border-info rounded-3">
          <h2 h2 className="text-center">
            Change password
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="emailid" className="form-label">
                Enter Your New Password
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your new password"
                name="pssword"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              {/* {error && <div className={styles.error_msg}>{error}</div>}
              {msg && <div className={styles.success_msg}>{msg}</div>} */}
            </div>
            <div className="text-center ">
              <button
                type="submit"
                className="btn btn-outline-info w-100 btnstyle"
              >
                reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Resetpassword;

// const param = useParams();
//   const [validUrl, setValidUrl] = useState(false);
//   const [password, setPassword] = useState("");
//   const [msg, setMsg] = useState("");
//   const [error, setError] = useState("");

//   const url = `http://localhost:7000/v1/user/password-reset/${param.id}/${param.token}`;
//   useEffect(() => {
//     const Urlverify = async () => {
//       try {
//         await axios.get(
//           `http://localhost:7000/v1/user/password-reset/${param.id}/${param.token}`
//         );
//         setValidUrl(true);
//         console.log(validUrl);
//       } catch (error) {
//         setValidUrl(false);
//       }
//     };
//     Urlverify();
//   }, [param, url]);

//   const handlesubmit = async (e) => {
//     // console.log(e);
//     e.preventDefault();
//     try {
//       const { data } = await axios.post(url, { password });
//       setMsg(data.message);
//       setError("");
//       window.location = "/";
//     } catch (error) {
//       if (
//         error.response &&
//         error.response.status >= 400 &&
//         error.response.status <= 500
//       ) {
//         setError(error.response.data.message);
//         setMsg("");
//       }
//     }
//   };

//   return (
//     <>
//       {validUrl ? (
//         <div className="container my-5 ">
//           <div className=" col-sm-8 offset-sm-2 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4 p-4 border">
//             <h2 className="text-center">Change password</h2>
//             <form onSubmit={handlesubmit}>
//               <div className="mb-3">
//                 <label htmlFor="password" className="form-label">
//                   Enter your new Password:
//                 </label>
//                 <input
//                   type="password"
//                   className="form-control"
//                   placeholder="Enter your password"
//                   name="password"
//                   onChange={(e) => setPassword(e.target.value)}
//                   value={password}
//                 />
//                 {/* {error && <div className={styles.error_msg}>{error}</div>}
//                 {msg && <div className={styles.success_msg}>{msg}</div>} */}
//               </div>
//               <div className="text-center ">
//                 <button
//                   type="submit"
//                   className="btn btn-outline-success w-100 btnstyle"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       ) : (
//         <h1>404 Not Found</h1>
//       )}
//     </>
//   );
