export const config = {
  stationEndpoint: process.env.STATION_ENDPOINT || 'http://localhost:3000/api/stations',
  statusEndpoint: process.env.STATUS_ENDPOINT || 'http://localhost:3000/api/status'
};
