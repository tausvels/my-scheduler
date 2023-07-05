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
export default solveMyCaptcha