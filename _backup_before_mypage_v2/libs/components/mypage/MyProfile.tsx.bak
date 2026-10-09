import React, { useCallback, useEffect, useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { Button, Stack, Typography } from '@mui/material';
import axios from 'axios';
import { Messages, REACT_APP_API_URL } from '../../config';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { sweetErrorHandling, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';

const MyProfile: NextPage = ({ initialValues, ...props }: any) => {
	const device = useDeviceDetect();
	const token = getJwtToken();
	const user = useReactiveVar(userVar);
	const [updateData, setUpdateData] = useState<MemberUpdate>(initialValues);

	/** APOLLO REQUESTS **/
	// UPDATE_MEMBER — apollo/user/mutation.ts dan; profil maydonlarini (ism, telefon, manzil, rasm) yangilash uchun mutatsiya
	const [updateMember] = useMutation(UPDATE_MEMBER);

	/** LIFECYCLES **/
	// userVar (global reactive variable, apollo/store.ts) o'zgarganda ishga tushadi —
	// formani hozirgi profil ma'lumotlari bilan to'ldiradi, aks holda forma bo'sh ochiladi
	useEffect(() => {
		setUpdateData({
			...updateData,
			memberNick: user.memberNick,
			memberPhone: user.memberPhone,
			memberAddress: user.memberAddress,
			memberImage: user.memberImage,
		});
	}, [user]);

	/** HANDLERS **/
	// profil rasmi tanlanganda: rasmni GraphQL upload orqali (Apollo mutatsiyadan emas, to'g'ridan-to'g'ri axios bilan) yuboradi
	const uploadImage = async (e: any) => {
		try {
			const image = e.target.files[0]; // <input type="file"> orqali tanlangan rasm
			console.log('+image:', image);

			const formData = new FormData(); // ko'p qismli (multipart) so'rov tanasi
			formData.append(
				'operations', // GraphQL multipart spetsifikatsiyasi talab qiladigan nom — so'rov shu yerda yuboriladi
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
				  }`, // backend'dagi "bitta rasm yuklash" mutatsiyasi
					variables: {
						file: null, // haqiqiy fayl pastda 'map' orqali bog'lanadi
						target: 'member', // qaysi papkaga saqlanishi (profil rasmlari)
					},
				}),
			);
			formData.append(
				'map', // qaysi formData kaliti qaysi variables.file'ga tegishli ekanini bildiradi
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image); // tanlangan faylning o'zi

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data', // fayl yuklash uchun majburiy header
					'apollo-require-preflight': true, // Apollo Server'ga bu GraphQL multipart so'rov ekanini bildiradi
					Authorization: `Bearer ${token}`, // login qilingan foydalanuvchi tokeni
				},
			});

			const responseImage = response.data.data.imageUploader; // backend qaytargan yuklangan rasm fayl nomi
			console.log('+responseImage: ', responseImage);
			updateData.memberImage = responseImage; // formadagi rasm maydonini yangilaydi
			setUpdateData({ ...updateData });

			return `${REACT_APP_API_URL}/${responseImage}`; // to'liq rasm URL'ini qaytaradi
		} catch (err) {
			console.log('Error, uploadImage:', err);
		}
	};

	// profilni yangilash: mutatsiya yuboradi, backend yangi token qaytaradi,
	// shu token bilan localStorage va global userVar'ni ham yangilaydi (qayta login qilmasdan)
	const updateCarHandler = useCallback(async () => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			updateData._id = user._id;
			const result = await updateMember({
				variables: {
					input: updateData,
				},
			});

			// @ts-ignore
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(result.data.updateMember?.accessToken);
			await sweetMixinSuccessAlert('information updated successfully.');
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	}, [updateData]);

	const doDisabledCheck = () => {
		if (
			updateData.memberNick === '' ||
			updateData.memberPhone === '' ||
			updateData.memberAddress === '' ||
			updateData.memberImage === ''
		) {
			return true;
		}
	};

	console.log('+updateData', updateData);

	if (device === 'mobile') {
		return <>MY PROFILE PAGE MOBILE</>;
	} else
		return (
			<div id="my-profile-page">
				<Stack className="main-title-box">
					<Stack className="right-box">
						<Typography className="main-title">My Profile</Typography>
						<Typography className="sub-title">We are glad to see you again!</Typography>
					</Stack>
				</Stack>
				<Stack className="top-box">
					<Stack className="photo-box">
						<Typography className="title">Photo</Typography>
						<Stack className="image-big-box">
							<Stack className="image-box">
								<img
									src={
										updateData?.memberImage
											? `${REACT_APP_API_URL}/${updateData?.memberImage}`
											: `/img/profile/defaultUser.svg`
									}
									alt=""
								/>
							</Stack>
							<Stack className="upload-big-box">
								<input
									type="file"
									hidden
									id="hidden-input"
									onChange={uploadImage}
									accept="image/jpg, image/jpeg, image/png"
								/>
								<label htmlFor="hidden-input" className="labeler">
									<Typography>Upload Profile Image</Typography>
								</label>
								<Typography className="upload-text">A photo must be in JPG, JPEG or PNG format!</Typography>
							</Stack>
						</Stack>
					</Stack>
					<Stack className="small-input-box">
						<Stack className="input-box">
							<Typography className="title">Username</Typography>
							<input
								type="text"
								placeholder="Your username"
								value={updateData.memberNick}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberNick: value })}
							/>
						</Stack>
						<Stack className="input-box">
							<Typography className="title">Phone</Typography>
							<input
								type="text"
								placeholder="Your Phone"
								value={updateData.memberPhone}
								onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberPhone: value })}
							/>
						</Stack>
					</Stack>
					<Stack className="address-box">
						<Typography className="title">Address</Typography>
						<input
							type="text"
							placeholder="Your address"
							value={updateData.memberAddress}
							onChange={({ target: { value } }) => setUpdateData({ ...updateData, memberAddress: value })}
						/>
					</Stack>
					<Stack className="about-me-box">
						<Button className="update-button" onClick={updateCarHandler} disabled={doDisabledCheck()}>
							<Typography>Update Profile</Typography>
							<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
								<g clipPath="url(#clip0_7065_6985)">
									<path
										d="M12.6389 0H4.69446C4.49486 0 4.33334 0.161518 4.33334 0.361122C4.33334 0.560727 4.49486 0.722245 4.69446 0.722245H11.7672L0.105803 12.3836C-0.0352676 12.5247 -0.0352676 12.7532 0.105803 12.8942C0.176321 12.9647 0.268743 13 0.361131 13C0.453519 13 0.545907 12.9647 0.616459 12.8942L12.2778 1.23287V8.30558C12.2778 8.50518 12.4393 8.6667 12.6389 8.6667C12.8385 8.6667 13 8.50518 13 8.30558V0.361122C13 0.161518 12.8385 0 12.6389 0Z"
										fill="white"
									/>
								</g>
								<defs>
									<clipPath id="clip0_7065_6985">
										<rect width="13" height="13" fill="white" />
									</clipPath>
								</defs>
							</svg>
						</Button>
					</Stack>
				</Stack>
			</div>
		);
};

MyProfile.defaultProps = {
	initialValues: {
		_id: '',
		memberImage: '',
		memberNick: '',
		memberPhone: '',
		memberAddress: '',
	},
};

export default MyProfile;
