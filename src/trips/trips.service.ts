import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Trip } from './interfaces/trip.interface';
import { TripDTO } from './dto/trip.dto';
@Injectable()
export class TripsService {
  constructor(@InjectModel('Trip') private tripModel: Model<Trip>) {}

  async getTrips(page = 1, limit = 25): Promise<any> {
    const trips = await this.tripModel
      .find()
      .skip(Number(limit) * (Number(page) - 1))
      .limit(Number(limit));

    const count = await this.tripModel.countDocuments();
    return {
      info: {
        count,
        currentPageCount: trips.length,
        pages: Math.ceil(count / limit),
        page: Number(page),
      },
      trips,
    };
  }

  async getTrip(id: string): Promise<Trip> {
    const trip = await this.tripModel.findById(id);
    return trip;
  }

  async countTrips(): Promise<any> {
    const count = await this.tripModel.countDocuments();
    return {
      count,
    };
  }

  async countByCityTrips(city = '.'): Promise<any> {
    const result = await this.tripModel.aggregate([
      {
        $match: {
          'city.name': {
            $regex: new RegExp(`${city}`),
            $options: 'i',
          },
        },
      },
      {
        $group: {
          _id: { city: '$city.name', country: '$country.name' },
          count: {
            $sum: 1,
          },
        },
      },
    ]);
    return result;
  }

  async createTrip(tripDTO: TripDTO): Promise<Trip> {
    const trip = new this.tripModel(tripDTO);
    return await trip.save();
  }

  async updateTrip(id: string, tripDTO: TripDTO): Promise<Trip> {
    const trip = await this.tripModel.findByIdAndUpdate(id, tripDTO, {
      new: true,
    });
    return trip;
  }

  async deleteTrip(id: string): Promise<Trip> {
    const trip = await this.tripModel.findByIdAndDelete(id);
    return trip;
  }
}
