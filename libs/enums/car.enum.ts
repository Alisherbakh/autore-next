export enum CarType {
	SEDAN = 'SEDAN',
	SUV = 'SUV',
	HATCHBACK = 'HATCHBACK',
	COUPE = 'COUPE',
	CONVERTIBLE = 'CONVERTIBLE',
	WAGON = 'WAGON',
	VAN = 'VAN',
	PICKUP = 'PICKUP',
}

export enum CarStatus {
	ACTIVE = 'ACTIVE',
	RESERVED = 'RESERVED',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}

export enum CarLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}

export enum CarBrand {
	// koreys brendlari (birinchi)
	HYUNDAI = 'HYUNDAI',
	KIA = 'KIA',
	GENESIS = 'GENESIS',
	KGM = 'KGM',
	CHEVROLET = 'CHEVROLET', // GM Korea
	RENAULT = 'RENAULT', // Renault Korea
	// import brendlar
	TOYOTA = 'TOYOTA',
	BMW = 'BMW',
	MERCEDES = 'MERCEDES',
	AUDI = 'AUDI',
	VOLKSWAGEN = 'VOLKSWAGEN',
	TESLA = 'TESLA',
	OTHER = 'OTHER',
}

export enum CarFuelType {
	GASOLINE = 'GASOLINE',
	DIESEL = 'DIESEL',
	HYBRID = 'HYBRID',
	ELECTRIC = 'ELECTRIC',
	LPG = 'LPG',
	HYDROGEN = 'HYDROGEN',
}

export enum CarTransmission {
	AUTOMATIC = 'AUTOMATIC',
	MANUAL = 'MANUAL',
}

export enum CarCondition {
	NEW = 'NEW',
	USED = 'USED',
}
