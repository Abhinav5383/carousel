import { createEffect, createSignal, For } from "solid-js";
import "./App.css";

export default function App() {
	const images: ImgData[] = [1, 2, 3, 4, 5, 6].map((id) => {
		return {
			src: `https://picsum.photos/800/600?random=${id}`,
			alt: `Image ${id}`,
		};
	});

	return (
		<main>
			<Carousel images={images} />
		</main>
	);
}

interface CarouselProps {
	images: ImgData[];
}

interface ImgData {
	src: string;
	alt: string;
}

interface InTreeNodes {
	idx: number;
	class: string;
}

function Carousel(props: CarouselProps) {
	const loadedImages = new Set<string>();
	const [currIdx, setCurrIdx] = createSignal(0);
	const [inTreeNodes, setInTreeNodes] = createSignal<InTreeNodes[]>([
		{
			idx: 0,
			class: "slide-in",
		},
	]);

	createEffect<number>((prev = 0) => {
		const next = currIdx();
		const lastItem = props.images.length - 1;

		let direction = "left";
		// wrap around
		if (next === 0 && prev === lastItem) direction = "left";
		else if (next === lastItem && prev === 0) direction = "right";
		else if (next < prev) direction = "right";

		setInTreeNodes([
			{
				idx: prev,
				class: `slide-out ${direction}`,
			},
			{
				idx: next,
				class: `slide-in ${direction}`,
			},
		]);

		return next;
	});

	function previous() {
		setCurrIdx((prev) => {
			if (prev - 1 < 0) return props.images.length - 1;
			return prev - 1;
		});
	}

	function next() {
		setCurrIdx((prev) => {
			if (prev + 1 >= props.images.length) return 0;
			return prev + 1;
		});
	}

	function goto(newIdx: number) {
		setCurrIdx(newIdx);
	}

	createEffect(async () => {
		const curr = currIdx();
		const _preload = [
			curr + 1,
			curr - 1,
			curr + 2,
			curr - 2,
			curr + 3,
			curr - 3,
		];
		const preloadIndices: number[] = [];

		for (const idx of _preload) {
			const _imgIdx =
				idx < 0 ? props.images.length + idx : idx % props.images.length;
			if (preloadIndices.includes(_imgIdx)) continue;
			preloadIndices.push(_imgIdx);
		}

		for (const idx of preloadIndices) {
			const data = props.images[idx];
			if (!data) continue;

			const img = new Image();
			img.src = data.src;
			img.onload = () => {
				loadedImages.add(data.src);
			};
		}
	});

	return (
		<figure
			class="carousel-container"
			tabindex={0}
			onKeyDown={(ev) => {
				if (ev.key === "ArrowLeft") {
					previous();
				} else if (ev.key === "ArrowRight") {
					next();
				}
			}}
		>
			<div class="img-wrapper">
				<For each={inTreeNodes()}>
					{(node) => {
						const _img = props.images[node.idx];
						if (!_img) return null;

						return <img src={_img.src} alt={_img.alt} class={node.class} />;
					}}
				</For>

				<button
					class="btn prev"
					type="button"
					aria-label="Previous"
					onClick={previous}
				>
					&#10092;
				</button>

				<button class="btn next" type="button" aria-label="Next" onClick={next}>
					&#10093;
				</button>
			</div>

			<div class="indicators">
				<For each={props.images}>
					{(_, index) => (
						// biome-ignore lint/a11y/noStaticElementInteractions: idk
						// biome-ignore lint/a11y/useKeyWithClickEvents: idk
						<div onClick={() => goto(index())}>
							<span class={currIdx() === index() ? "active" : ""} />
						</div>
					)}
				</For>
			</div>

			<figcaption>{props.images[currIdx()].alt}</figcaption>
		</figure>
	);
}
