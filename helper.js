import 'dotenv/config'
import axios from 'axios';
import { ParkName } from './constants.js';

const solveMyCaptcha = async (imageInBase64) => {
  imageInBase64 = imageInBase64.replace(/^data:image\/(png|jpg|jpeg|gif);base64,/, "")
  const params = {
    USER_ID: process.env.USER_ID,
    API_KEY: process.env.API_KEY,
    data: imageInBase64,
  }
  const url = process.env.CAPTCHA_URL;

  return axios.post(url, {
    ...params
  }).then((response) => {
    return response.data
  }).catch(err => err)
}

const displayDateAndTime = () => {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const day = String(currentDate.getDate()).padStart(2, "0");
  const dayOfWeek = daysOfWeek[currentDate.getDay()];
  const time = currentDate.toLocaleTimeString();

  return `Date: ${year}-${month}-${day}, Day: ${dayOfWeek} and Time is: ${time}`;
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isPassAvailable = (apiResponse, timeOfDay, passRequired) => {
  if (!passRequired) {
    throw new Error(`Number of pass is required.`)
  }
  const availityTimeFromResponse = Object.keys(apiResponse) // gives DAY, AM, PM
  if (!availityTimeFromResponse.includes(timeOfDay)) {
    throw new Error(`Time of day of ${timeOfDay} is not included. Available options are ${availityTimeFromResponse.join(', ')}`)
  }

  const { capacity, max } = apiResponse[timeOfDay]
  return capacity !== 'Full' && max >= passRequired
}

const checkAvailibilityOfPass = async ({
  nameOfPark, option, visitDate, passType, noOfPassRerequired
}) => {
  try {
    // check for errors in park name
    const availableParkNames = Object.keys(ParkName);
    const invalidOrNoDateErr = `No date or invalid date. Must be in the format: Tuesday, July 11, 2023`
    const invalidParkNameErr = `Park name is required and must match any of the following: ${availableParkNames.join(', ')}}`
    const invalidFacilityErr = `Facility cannont be an object. Use option arg of the function`

    if (!nameOfPark) throw new Error(invalidParkNameErr)
    if (!visitDate) throw new Error(invalidOrNoDateErr)
    if (!passType) throw new Error(`Available options are DAY, AM or PM`)
    if (!noOfPassRerequired) throw new Error(`Minimum number of pass required is 1`)
    if (nameOfPark && !availableParkNames.includes(nameOfPark)) throw new Error(invalidParkNameErr)

    const parkKey = availableParkNames.find((key) => key.toLowerCase() === nameOfPark.toLowerCase())

    const parkObject = ParkName[parkKey]
    const facilityValues = Object.values(parkObject.facility).join(', ')

    if (parkObject.facility[option] !== option) {
      throw new Error(`${invalidFacilityErr}. Available options are: ${facilityValues}`)
    }

    const formattedDate = new Date(visitDate).toISOString().split('T')[0];
    const facility = `?facility=${option}&park=${parkObject.code}` 
    const url = `${process.env.AVAILABILITY_URL_PREFIX}/${process.env.RESERVATION_PREFIX}${facility}`

    const { data } = await axios.request({ url, method: 'GET' })

    console.log('data available --> ', data)
    let timeOfDay = passType.toLowerCase()
    if (timeOfDay === 'day') { timeOfDay = 'DAY'}
    else if (timeOfDay === 'pm') { timeOfDay = 'PM'}
    else if (timeOfDay === 'am') { timeOfDay = 'AM'}
    
    const isAvailable = data ? isPassAvailable(data[formattedDate], timeOfDay, noOfPassRerequired) : false
    return isAvailable

  } catch (error) {
    console.log('returning here ', error.message)
    return error
  }
}

export {
  solveMyCaptcha,
  displayDateAndTime,
  delay,
  checkAvailibilityOfPass,
  isPassAvailable
}