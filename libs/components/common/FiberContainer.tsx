import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense } from 'react';
import { Preload, Image as ImageImpl } from '@react-three/drei';
import { ScrollControls, Scroll } from './ScrollControls';
import * as THREE from 'three';

// Bosh sahifadagi 3D galereya (nestar-next'dan ko'chirilgan, mantiq o'zgarmagan):
// cheksiz gorizontal lenta, sichqoncha/trackpad bilan aylantiriladi.
// Rasmlar: public/img/fiber/car1–8.jpg (Wikimedia Commons, mualliflar — public/img/fiber/CREDITS.md)

function Image(props: any) {
	const ref = useRef<THREE.Group>();
	const group = useRef<THREE.Group>();

	return (
		// @ts-ignore
		<group ref={group}>
			<ImageImpl ref={ref} {...props} />
		</group>
	);
}

// bitta "sahifa" — yonma-yon 3 ta rasm, chuqurlik (z) bilan
function Page({ m = 0.4, urls, ...props }: any) {
	const { width } = useThree((state) => state.viewport);
	const w = width < 10 ? 1.5 / 3 : 1 / 3;

	return (
		<group {...props}>
			<Image position={[-width * w, 0, -1]} scale={[width * w - m * 2, 5, 1]} url={urls[0]} />
			<Image position={[0, 0, 0]} scale={[width * w - m * 2, 5, 1]} url={urls[1]} />
			<Image position={[width * w, 0, 1]} scale={[width * w - m * 2, 5, 1]} url={urls[2]} />
		</group>
	);
}

function Pages() {
	const { width } = useThree((state) => state.viewport);

	return (
		<>
			<Page position={[width * 0, 0, 0]} urls={['/img/fiber/car1.jpg', '/img/fiber/car2.jpg', '/img/fiber/car3.jpg']} />
			<Page position={[width * 1, 0, 0]} urls={['/img/fiber/car4.jpg', '/img/fiber/car5.jpg', '/img/fiber/car6.jpg']} />
			<Page position={[width * 2, 0, 0]} urls={['/img/fiber/car7.jpg', '/img/fiber/car8.jpg', '/img/fiber/car4.jpg']} />
			{/* 3- va 4-sahifalar 0- va 1-sahifani takrorlaydi — cheksiz aylanish uzilmasdan ulanadi (nestar bilan bir xil) */}
			<Page position={[width * 3, 0, 0]} urls={['/img/fiber/car1.jpg', '/img/fiber/car2.jpg', '/img/fiber/car3.jpg']} />
			<Page position={[width * 4, 0, 0]} urls={['/img/fiber/car4.jpg', '/img/fiber/car5.jpg', '/img/fiber/car6.jpg']} />
		</>
	);
}

// brauzer WebGL kontekst yarata oladimi (o'chirilgan WebGL / GPU yo'q bo'lsa — false)
function hasWebGL(): boolean {
	try {
		const canvas = document.createElement('canvas');
		return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
	} catch (e) {
		return false;
	}
}

// WebGL ishlamasa ko'rsatiladigan oddiy (3D'siz) galereya — xuddi shu rasmlar
function StaticGallery() {
	return (
		<div className={'gallery-fallback'}>
			{['/img/fiber/car1.jpg', '/img/fiber/car2.jpg', '/img/fiber/car3.jpg'].map((url) => (
				<img key={url} src={url} alt={''} />
			))}
		</div>
	);
}

// 3D qismida kutilmagan xato bo'lsa butun bosh sahifa yiqilmasligi uchun — o'rniga StaticGallery
class GalleryErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidCatch(error: any) {
		console.warn('3D gallery disabled:', error?.message);
	}

	render() {
		return this.state.failed ? <StaticGallery /> : this.props.children;
	}
}

export default function FiberContainer() {
	// null — hali tekshirilmagan (server va birinchi render), keyin true/false
	const [webgl, setWebgl] = useState<boolean | null>(null);

	useEffect(() => {
		setWebgl(hasWebGL());
	}, []);

	return (
		<div className="threeJSContainer" style={{ marginTop: '100px', width: '100%', height: '512px' }}>
			{webgl === false && <StaticGallery />}
			{webgl === true && (
				<GalleryErrorBoundary>
					<Canvas gl={{ antialias: false }} dpr={[1, 1.5]}>
						<Suspense fallback={null}>
							<ScrollControls infinite horizontal damping={4} pages={4} distance={1}>
								<Scroll>
									<Pages />
								</Scroll>
							</ScrollControls>
							<Preload />
						</Suspense>
					</Canvas>
				</GalleryErrorBoundary>
			)}
		</div>
	);
}
