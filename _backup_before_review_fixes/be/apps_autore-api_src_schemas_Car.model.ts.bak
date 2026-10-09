import { Schema } from 'mongoose';
import {
	CarBrand,
	CarCondition,
	CarFuelType,
	CarLocation,
	CarStatus,
	CarTransmission,
	CarType,
} from '../libs/enums/car.enum';

const CarSchema = new Schema(
	{
		carType: {
			type: String,
			enum: CarType,
			required: true,
		},

		carStatus: {
			type: String,
			enum: CarStatus,
			default: CarStatus.ACTIVE,
		},

		carLocation: {
			type: String,
			enum: CarLocation,
			required: true,
		},

		carAddress: {
			type: String,
			required: true,
		},

		carTitle: {
			type: String,
			required: true,
		},

		carPrice: {
			type: Number,
			required: true,
		},

		carBrand: {
			type: String,
			enum: CarBrand,
			required: true,
		},

		carModel: {
			// masalan: Sonata, K5, Model 3
			type: String,
			required: true,
		},

		carYear: {
			// ishlab chiqarilgan yili
			type: Number,
			required: true,
		},

		carMileage: {
			// bosib o'tgan masofa (km)
			type: Number,
			required: true,
		},

		carFuelType: {
			type: String,
			enum: CarFuelType,
			required: true,
		},

		carTransmission: {
			type: String,
			enum: CarTransmission,
			required: true,
		},

		carCondition: {
			type: String,
			enum: CarCondition,
			default: CarCondition.USED,
		},

		carEngineSize: {
			// dvigatel hajmi (cc), elektr mashinalarda bo'lmaydi
			type: Number,
		},

		carSeats: {
			type: Number,
		},

		carColor: {
			type: String,
		},

		carVin: {
			// VIN raqam, bir xil mashina ikki marta joylanmasligi uchun
			type: String,
			index: { unique: true, sparse: true },
		},

		carViews: {
			type: Number,
			default: 0,
		},

		carLikes: {
			type: Number,
			default: 0,
		},

		carComments: {
			type: Number,
			default: 0,
		},

		carRank: {
			type: Number,
			default: 0,
		},

		carImages: {
			type: [String],
			required: true,
		},

		carDesc: {
			type: String,
		},

		carBarter: {
			// ayirboshlash mumkinmi
			type: Boolean,
			default: false,
		},

		carCredit: {
			// bo'lib to'lash (kredit) mumkinmi
			type: Boolean,
			default: false,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'cars' },
);

export default CarSchema;
