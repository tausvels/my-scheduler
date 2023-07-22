# About
This application does an automated booking for reservation passes for BC parks, the ones that requires a a Day Pass.

# Installation
```npm install```

# Configuration
*Look at `.env.example` on how to create your own `.env` file

# API Key needed for CAPTCHA solver
1. Create a free account at: https://truecaptcha.org
2. Get your userId (typically it will be your username)
3. Get your API Key
4. Update your .env file with these

# Available Params and Options (must be included in the env file):
1. DATE_OF_PASS must be in the format: `Wednesday, July 19, 2023`
2. TURN_OFF_CAPTCHA: true/false (this is for development purpose), default is false.
3. NAME_OF_PARK: Available options are: `Garibaldi, GoldenEars and Joffre`
4. NAME_OF_PROVENCIAL_PARK: Available options are: `Golden Ears, Joffre Lakes and Garibaldi`
5. Option (this applies because different parks have different options you can visit)Available options:
  * For Garibaldi --> `Cheakamus, Diamond Head and Rubble Creek`
  * For GoldenEars --> `Alouette Lake Boat Launch Parking, Alouette Lake South Beach, Gold Creek, West Canyon Trail`
  * For Joffre --> `Joffre Lakes`
6. PASS_TYPE='Day'
  Available options:
  * For Garibaldi and Joffre --> `Day`
  * For GoldenEars --> `AM, PM and DAY`
7. NO_OF_PASS_REQUIRED=1
    Available options:
  * For Joffre --> `1 to 4`
  * For Garibaldi and GoldenEars --> `1` (since it is per vehicle)
8. FIRST_NAME=`Your first name` LAST_NAME=`Your last name` EMAIL=`Your email address`
9. *For the cron job (which is basically schedulling when the automation should run and for how many times)
CRON_RUN_COUNT=2
CRON_RUN_TIME='*/10 11 21 * * *' 
`The above 2 params makes the program run at 10 seconds interval on the 11th minute of 21 hours two times`
10. AVAILABILITY_URL_PREFIX='https://jd7n1axqh0.execute-api.ca-central-1.amazonaws.com/api'
*This is the url at which the program will check for the availibility of passes for a given park
11. RESERVATION_PREFIX='reservation'
12. DAY_PASS_URL='https://bcparks.ca/reservations/day-use-passes/'
*This is the link where the automation is going to run

# Run the script
`npm start`

# Output
If successfully booked a reservation, the script with output a `qrCode.png` file within the root directory. You should also receive an email with the reservation along with the qrCode.

# Termination
To terminate the script, `ctrl + c`