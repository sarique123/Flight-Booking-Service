const {StatusCodes} = require('http-status-codes');
const AppError = require('../utils/errors/app-error');

const {Booking} = require('../models');
const CrudRepository = require('./crud-repository');

class BookingRepository extends CrudRepository {
    constructor(){
        super(Booking);
    }
    
    async createBooking(data, t){
        try {
            const response = await Booking.create(data, {transaction: t});
            return response;
        } catch (error) {
            console.log(error);
            
            throw error;
        }
    }

    async get(data,t){
        const response = await Booking.findByPk(data,{transaction: t});
        if(!response){
            throw new AppError('Not able to find the resource', StatusCodes.NOT_FOUND);
        }
        return response;
    }

    async update(data,id,t){
        console.log(data, id);
        
        const response = await Booking.update(data,{
            where: {
                id: id
            }
        },
        {
            transaction : t
        }
        );
        if(response[0] == 0){
            throw new AppError('Not able to find the resource',StatusCodes.NOT_FOUND);
        }
        return response;
    }
}

module.exports = BookingRepository;