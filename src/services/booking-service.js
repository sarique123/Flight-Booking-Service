const axios = require('axios'); 
const { BookingRepository } = require('../repositories');
const db = require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const {ServerConfig}= require('../config');
const {Enums} = require('../utils/common');
const {CANCELLED,BOOKED} = Enums.BOOKING_STATUS;

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

async function makePayment(data){
    try { 
        const result = await db.sequelize.transaction(async function paymentImpl(t) {
            const bookingDetails = await bookingRepository.get(data.bookingId,t);
            
            if(bookingDetails.status == CANCELLED){
                throw new AppError('The booking has expired',StatusCodes.BAD_REQUEST);
            }

            const bookingTime = new Date(bookingDetails.createdAt);
            const currentTime = new Date();
            
            if(currentTime - bookingTime > 300000){  
                await cancelBooking(data.bookingId);
                throw new AppError('The booking has expired',StatusCodes.BAD_REQUEST);
            }


            if(bookingDetails.totalCost != data.totalCost){
                throw new AppError('The amount of the payment does not match',StatusCodes.BAD_REQUEST);
            }
            
            if(bookingDetails.userId != data.userId){
                throw new AppError('The user corresponding to the booking does not match',StatusCodes.BAD_REQUEST);
            }
            
            // We assume here that payment has successfully completed
            await bookingRepository.update({status : BOOKED},data.bookingId,t);
        });
        return result;
    } catch (error) {
        throw error;
    }
}


async function cancelBooking(bookingId){
    try {
        const result = await db.sequelize.transaction(async function cancelBookingImpl(t) {
            const bookingDetails = await bookingRepository.get(bookingId,t);

            if(bookingDetails.status == CANCELLED){
                return true;
            }
            

            await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,{
                seats : bookingDetails.noOfSeats,
                dec : '0'  // for increasing the seats again.
            }); 

            await bookingRepository.update({status: CANCELLED},bookingId,t);
            return true;
        });
        return result;
    } catch (error) {
        throw error;
    }

}

async function cancelOldBookings() {
    try {
        const time = new Date(new Date().getTime() - 5*30*1000);
        const response = await bookingRepository.cancelOldBookings(time);
        return response;
    } catch (error) {
        console.log(error);
        
        throw error;
    }
}

module.exports = {
    createBooking,
    makePayment,
    cancelOldBookings
}