const {BookingService} = require('../services');
const {ErrorResponse,SuccessResponse} = require('../utils/common');
const {StatusCodes} = require('http-status-codes');

async function createBooking(req,res) {
    console.log("In controller");
    
    try {
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats
        });
        console.log(response);
        
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


module.exports = {
    createBooking
}