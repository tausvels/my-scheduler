import fs from 'fs';
import axios from 'axios';

const get_captcha = async (imageInBase64) => {
  imageInBase64 = imageInBase64.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, "")
  const params = {
    userid: 'cypherx32',
    apikey: '4HnpdPVhpuxPG00d6DfN',
    data: imageInBase64,
  }
  // console.log(imageInBase64)
  const url = "https://api.apitruecaptcha.org/one/gettext"

  return axios.post(url, {
    ...params
  }).then((response) => {
    return response.data
  }).catch(err => err)
}

// const imagePath = './captcha.png'
// const imageRawData = fs.readFileSync(imagePath)
// const base64Data = await imageRawData.toString('base64');

// get_captcha(base64Data)
// .then(result => {
//   console.log('##5 result is --> ', result)
// })
// .catch(err => {
//   console.log('##6 err -> ', err.message)
// })

export default get_captcha;