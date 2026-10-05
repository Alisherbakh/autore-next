export const REACT_APP_API_URL = `${process.env.REACT_APP_API_URL}`;

export const availableOptions = ['carBarter', 'carCredit'];

const thisYear = new Date().getFullYear();

export const carYears: any = [];

for (let i = 1990; i <= thisYear + 1; i++) {
	carYears.push(String(i));
}

// probeg (km) oraliqlari filter uchun
export const carMileages = [0, 10000, 30000, 50000, 80000, 100000, 150000, 200000, 300000];

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fulfill all inputs!',
	error4: 'Message is empty!',
	error5: 'Only images with jpeg, jpg, png format allowed!',
};

export const topCarRank = 2;
