const {BookingService} = require('../services');
const {ErrorResponse,SuccessResponse} = require('../utils/common');
const {StatusCodes} = require('http-status-codes');

async function createBooking(req,res) { 
    try {
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats
        });
        
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully booked the seat";

        return res
        .status(StatusCodes.CREATED)
        .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
        .status(error.statusCode)
        .json(ErrorResponse);
    } 
}

async function makePayment(req,res) {
    try {
        const response = await BookingService.makePayment({
            bookingId: req.body.bookingId,
            userId: req.body.userId,
            totalCost: req.body.totalCost
        });
        
        SuccessResponse.data = response;
        SuccessResponse.message = "Successfully completed the payment of flight";

        return res
        .status(StatusCodes.CREATED)
        .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res
        .status(error.statusCode)
        .json(ErrorResponse);
    }
}


module.exports = {
    createBooking,
    makePayment
}