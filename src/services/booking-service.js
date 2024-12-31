const axios = require('axios'); 
const { BookingRepository } = require('../repositories');
const db = require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const {ServerConfig}= require('../config');

const bookingRepository = new BookingRepository();

async function createBooking(data){
    try {
        const result = await db.sequelize.transaction(async function bookingImpl(t) {
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
            const flightData = flight.data.data;
            

            if(data.noOfSeats > flightData.totalSeats){
                throw new AppError('Not enough seats are available',StatusCodes.BAD_REQUEST);
            }

            const totalBillingAmount = data.noOfSeats*flightData.price;
            const bookingPayLoad = {...data, totalCost: totalBillingAmount};
            
            const booking = await bookingRepository.createBooking(bookingPayLoad, t);
           
            await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,{
                seats : data.noOfSeats,
                dec : '1'
            }); 
        
            return booking;
        });
        return result;
    } catch (error) { 
           throw error;
    }
}

module.exports = {
    createBooking
}