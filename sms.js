// otplib package is for generating otp - totp- for time based otp
const { totp } = require("otplib");
totp.options = { step: 300 }; // default expiry time for otp = 30 sec , step = 300 = 300 sec = 5 mins
const otpkey = "divya_otp_23"; // secrete key for otp generation

//otp generation function
function sendotp() {
  const otp = totp.generate(otpkey);
  console.log("token:" + otp);
  console.log("datatype of otp", typeof otp);
  return otp;
}
// to verify incoming otp with secrete key
function verify(otp) {
  console.log("token:" + otp);
  const compare = totp.check(otp, otpkey);
  console.log(compare);
  return compare;
}

//export both functions
module.exports = { sendotp, verify };

//  function twill(){
//     try {
//         twillo.messages.create({
//             from:'+18455249480',
//             to : "+919092484971",
//             body : 'your reset password otp :' + digit
//         }).then(mms=>{
//             console.log("sms sended")
//         }).catch(err=>{
//             console.log('err',err.message)
//         })
//     } catch (err) {
//         console.log(err.message)
//     }
//    }

//     module.exports = {twill}
