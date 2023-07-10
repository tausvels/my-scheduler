import 'dotenv/config'
import axios from 'axios';

const solveMyCaptcha = async (imageInBase64) => {
  imageInBase64 = imageInBase64.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, "")
  const params = {
    userid: process.env.userId,
    apikey: process.env.apikey,
    data: imageInBase64,
  }
  const url = "https://api.apitruecaptcha.org/one/gettext"

  return axios.post(url, {
    ...params
  }).then((response) => {
    return response.data
  }).catch(err => err)
}

const formatDateToString = () => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const dayOfWeek = daysOfWeek[currentDate.getDay()];
  const time = currentDate.toLocaleTimeString();

  return `Date: ${year}-${month}-${day}, Day: ${dayOfWeek} and Time is: ${time}`;
}
export {
  solveMyCaptcha,
  formatDateToString
}