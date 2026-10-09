import {
	CarBrand,
	CarCondition,
	CarFuelType,
	CarLocation,
	CarStatus,
	CarTransmission,
	CarType,
} from '../../enums/car.enum';
import { Direction } from '../../enums/common.enum';

export interface CarInput {
	carType: CarType;
	carLocation: CarLocation;
	carAddress: string;
	carTitle: string;
	carPrice: number;
	carBrand: CarBrand;
	carModel: string;
	carYear: number;
	carMileage: number;
	carFuelType: CarFuelType;
	carTransmission: CarTransmission;
	carCondition?: CarCondition;
	carEngineSize?: number;
	carSeats?: number;
	carColor?: string;
	carVin?: string;
	carImages: string[];
	carDesc?: string;
	carBarter?: boolean;
	carCredit?: boolean;
}

interface CarISearch {
	memberId?: string;
	locationList?: CarLocation[];
	typeList?: CarType[];
	brandList?: CarBrand[];
	fuelTypeList?: CarFuelType[];
	transmissionList?: CarTransmission[];
	conditionList?: CarCondition[];
	options?: string[];
	pricesRange?: Range;
	yearsRange?: Range;
	mileageRange?: Range;
	periodsRange?: PeriodsRange;
	text?: string;
}

export interface CarsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: CarISearch;
}

interface DCISearch {
	carStatus?: CarStatus;
}

export interface DealerCarsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: DCISearch;
}

interface ALCISearch {
	carStatus?: CarStatus;
	carLocationList?: CarLocation[];
}

export interface AllCarsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALCISearch;
}

interface Range {
	start: number;
	end: number;
}

interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}
