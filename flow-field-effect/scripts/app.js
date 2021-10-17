/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("effect-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class FlowFieldConfigSettings {
	constructor() {
		this.lineLengthMultiplier = 3;
		this.radiusMax = 9;
		this.radiusMin = 0;
		this.radiusVelocity = 0.03;
		this.cellSize = 8;
		this.lineWidth = 0.5;
		this.zoomLevel = 0.02;
	}

	randomize() {
		this.lineLengthMultiplier = Math.random() * 100 + 1;
		this.radiusMax = Math.random() * 10 + 7;
		this.radiusMin = Math.random() * 5;
		this.radiusVelocity = Math.random() * 0.05 + 0.005;
		this.cellSize = Math.random() * 10 + 5;
		this.lineWidth = Math.random() * 1 + 0.1;
		this.zoomLevel = Math.random() * 0.1;
		console.log("Random config:", this);
	}
}

class FlowFieldEffect {
	/** @type {CanvasRenderingContext2D} */
	#ctx;
	#height = 0;
	#width = 0;
	/** @type {FlowFieldConfigSettings} */
	#config;

	constructor(ctx, width, height, config) {
		this.#ctx = ctx;
		this.#height = height;
		this.#width = width;
		this.#config = config ? config : new FlowFieldConfigSettings();

		this.lastTime = 0;
		this.interval = 1000 / 60;
		this.timer = 0;

		this.cellSize = this.#config.cellSize;
		this.zoomLevel = this.#config.zoomLevel;
		this.#ctx.lineWidth = this.#config.lineWidth;
		this.#ctx.strokeStyle = this.#createGradient();

		this.radius = this.#config.radiusMin;
		this.vr = this.#config.radiusVelocity;
	}

	#createGradient() {
		let gradient = this.#ctx.createLinearGradient(
			0,
			0,
			this.#width,
			this.#height
		);
		gradient.addColorStop("0.0", "#ff5c33");
		gradient.addColorStop("0.2", "#ff6663");
		gradient.addColorStop("0.4", "#ccccff");
		gradient.addColorStop("0.6", "#b3ffff");
		gradient.addColorStop("0.8", "#80ff80");
		gradient.addColorStop("1.0", "#ffff33");
		return gradient;
	}

	#drawLine(angle, x, y) {
		const length = this.cellSize * 3;
		this.#ctx.beginPath();
		this.#ctx.moveTo(x, y);
		this.#ctx.lineTo(
			x + Math.cos(angle) * length,
			y + Math.sin(angle) * length
		);
		this.#ctx.stroke();
	}

	animate(timestamp) {
		const deltatime = timestamp - this.lastTime;
		this.lastTime = timestamp;
		this.timer += deltatime;
		if (this.timer >= this.interval) {
			this.#ctx.clearRect(0, 0, this.#width, this.#height);

			if (
				this.radius > this.#config.radiusMax ||
				this.radius < this.#config.radiusMin
			) {
				this.vr *= -1;
			}

			this.radius += this.vr;

			for (let y = 0; y < this.#height; y += this.cellSize) {
				for (let x = 0; x < this.#width; x += this.cellSize) {
					const angle =
						(Math.cos(x * this.zoomLevel) + Math.sin(y * this.zoomLevel)) *
						this.radius;
					this.#drawLine(angle, x, y);
				}
			}

			this.timer = 0;
		}
	}
}

let config = {
	cellSize: 6,
	lineLengthMultiplier: 46,
	lineWidth: 0.6,
	radiusMax: 10,
	radiusMin: 4,
	radiusVelocity: 0.05,
	zoomLevel: 0.01,
};

let flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height, config);
let animationFrame;
const mouse = {
	x: 0,
	y: 0,
};

function animationLoop(timestamp) {
	flowField.animate(timestamp);
	animationFrame = requestAnimationFrame(animationLoop);
}

// resize canvas on resize event
addEventListener("resize", () => {
	cancelAnimationFrame(animationFrame);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height);
	animationFrame = requestAnimationFrame(animationLoop);
});

addEventListener("mousemove", (e) => {
	mouse.x = e.x;
	mouse.y = e.y;
});

addEventListener("mousedown", () => {
	cancelAnimationFrame(animationFrame);
	let config = new FlowFieldConfigSettings();
	config.randomize();
	flowField = new FlowFieldEffect(ctx, canvas.width, canvas.height, config);
	animationFrame = requestAnimationFrame(animationLoop);
});

window.onload = function () {
	animationFrame = requestAnimationFrame(animationLoop);
};
