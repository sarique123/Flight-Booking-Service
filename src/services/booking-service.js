const axios = require('axios'); 
const { BookingRepository } = require('../repositories');
const db = require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const {ServerConfig}= require('../config')

async function createBooking(data){
    console.log(data);
    
    try {
        const result = await db.sequelize.transaction(async function bookingImpl(t) {
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
            console.log(flight);
            
            const flightData = flight.data.data;
            
            if(data.noOfSeats > flightData.totalSeats){
                throw new AppError('Not enough seats are available',StatusCodes.BAD_REQUEST);
            }
            console.log(flight);
            return flight;
        });
    } catch (error) { 
           throw error;
    }
}

module.exports = {
    createBooking
}