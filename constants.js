const ParkName = {
  Garibaldi: { 
    facility: {
      Cheakamus: 'Cheakamus',
      'Diamond Head': 'Diamond Head',
      'Rubble Creek': 'Rubble Creek'
    }, 
    code: '0007'
  },
  GoldenEars: {
    facility: {
      'Alouette Lake Boat Launch Parking': 'Alouette Lake Boat Launch Parking',
      'Alouette Lake South Beach': 'Alouette Lake South Beach Day-Use Parking Lot',
      'Gold Creek': 'Gold Creek Parking Lot',
      'West Canyon Trail': 'West Canyon Trailhead Parking Lot'
    },
    code: '0008'
  },
  Joffre: {
    facility: { 'Joffre Lakes': 'Joffre Lakes'}, code: '0363'
  },
}

export { ParkName }

/*
https://jd7n1axqh0.execute-api.ca-central-1.amazonaws.com/api/reservation?facility=Joffre Lakes&park=0363

https://jd7n1axqh0.execute-api.ca-central-1.amazonaws.com/api/reservation?facility=Cheakamus&park=0007

https://jd7n1axqh0.execute-api.ca-central-1.amazonaws.com/api/reservation?facility=Diamond%20Head&park=0007

https://jd7n1axqh0.execute-api.ca-central-1.amazonaws.com/api/reservation?facility=Rubble%20Creek&park=0007



https://jd7n1axqh0.execute-api.ca-central-1.amazonaws.com/api/reservation?facility=Alouette%20Lake%20Boat%20Launch%20Parking&park=0008

https://jd7n1axqh0.execute-api.ca-central-1.amazonaws.com/api/reservation?facility=Alouette%20Lake%20South%20Beach%20Day-Use%20Parking%20Lot&park=0008

https://jd7n1axqh0.execute-api.ca-central-1.amazonaws.com/api/reservation?facility=Gold%20Creek%20Parking%20Lot&park=0008

https://jd7n1axqh0.execute-api.ca-central-1.amazonaws.com/api/reservation?facility=West%20Canyon%20Trailhead%20Parking%20Lot&park=0008
*/