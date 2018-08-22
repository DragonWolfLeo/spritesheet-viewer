import React from "react";
import Controller from "./Controller";
import "../CSS/Preview.css";
import MenuButton from "./MenuButton";

class Preview extends React.Component {
	constructor(props){
		super(props);
		this.state = {
			isPlaying: false,
			isError: false,
			frame: 0,
			totalFrames: 0,
		}
		this.animateTask = null;
		this.resumeTask = null;
		this.animation = null;
		this.lockedParams = {
			scale: 2,
			delay: 33,
			transparent: "#FF00FF",
		}

		// Screen management
		this.screens = ["preview", "upload", "loading"];
		this.screens.current = "upload";
		this.screens.changeTo = function(scr) {
			if(!scr){
				scr = this.current;
			}
			scr += "Screen";
			this.forEach((item)=>{
				item += "Screen";
				const target = document.getElementById(item);
				if(!target){
					return;
				}
				if(item === scr){
					target.classList.remove("dn");
				} else {
					target.classList.add("dn");
				}
			});
			this.current = scr;
		}
	}
	componentDidMount() {
		this.screens.changeTo("upload");
	}

	// Prevent opening the image
	onDragOver(event){
		event.preventDefault();
	}
	setImage = (imagesrc, filename) =>{
		if(!this.screens.current === "preview"){
			// Don't interrupt preview with a loading screen
			this.screens.changeTo("loading");
		}
		const canvas = document.getElementById("canvas");
		const image = new Image();
		image.src = imagesrc;
		image.onload = () => {
			this.props.setImageLoaded();
			this.screens.changeTo("preview");

			// Assume whether the sprite sheet is horizontal or vertical
			const horizontal = image.width > image.height;
			const {width, height} = image;

			// Init animation
			const animation = {
				filename,
    			frame: 0,
    			image,
				canvas,
				horizontal,
				fspan: horizontal ? height : width,
				fthick: horizontal ? height : width,
				srclength: horizontal ? width : height,
				trimR: 0,
				trimL: 0,
				trimU: 0,
				trimD: 0,
				playback: "f",
				flipping: "n",
				mirroring: "n",
				forward: true,
			};
			// Apply locked parameters
			Object.assign(animation,this.lockedParams);

			// Update parameters as well as syncing locked params
			if(this.props.updateParameters){
				this.props.updateParameters(animation, this.lockedParams);
			}
			this.animation = animation;
			this.animation.totalFrames = this.calcTotalFrames();

			this.createAnimateTask(this.animate());
			this.setState({
				totalFrames: this.animation.totalFrames,
				isError: false,
				horizontal: horizontal,
			});
		}
		image.onerror = () => {
			clearTimeout(this.animateTask);
			this.props.setImageLoaded(false);
			this.setState({isError: true});
			this.screens.changeTo("upload");
		};
	}
	calcTotalFrames = () => {
		const a = this.animation;
		return Math.ceil(a.srclength/a.fspan);
	}

	// Called by Parameters to set new settings
	setNewProps = (props) => {
		Object.entries(props).forEach(item => {
			this.animation[item[0]] = item[1];
			if(this.lockedParams[item[0]] !== undefined){
				this.lockedParams[item[0]] = item[1];
			}
		});

		// Update frame count if frame span or trim is changed
		if(props.fspan){
			const a = this.animation;
			a.frame = 0;
			a.totalFrames = this.calcTotalFrames();
			this.setState({totalFrames: a.totalFrames});
		}
		
		// Update the frame
		this.animate(0)();
	}

	// Called by Parameters to lock or unlock a parameter
	lockParam = (prop, lock) => {
		console.log(lock ? "locking" : "unlocking", prop);
		if(lock){
			this.lockedParams[prop] = this.animation[prop];
		} else {
			delete this.lockedParams[prop];
		}
		return this.lockedParams;
	}
	// Create repeating animation task
	createAnimateTask = (fn) => {
		this.setState({isPlaying: true});
		this.renderFrame(); // Draw first frame
		const task = () => {
			clearTimeout(this.animateTask);
			this.animateTask = setTimeout(()=>{
				fn();
				task();
			}, this.animation.delay);
		}
		this.resumeTask = task;
		task();
	}

	// Return an animating function
    animate = (frameAdvance = null) => () => {
		const {animation} = this;
		const {playback, totalFrames} = animation;
		switch(playback){
			default:
				break;
			case "r":
				animation.forward = false;
				break;
			case "f":
				animation.forward = true;
		}

		// Update frame counter
		animation.frame += frameAdvance === null ? ( animation.forward ? 1 : -1) : frameAdvance;
		// Loop over if past range
		const reversePlayback = frameAdvance === null && playback === "b";
		if(animation.frame >= totalFrames){
			if(reversePlayback){ 
				animation.forward = false; 
				animation.frame = totalFrames-2;
			} else {
				animation.frame = 0;
			}
		}else if(animation.frame < 0){
			if(reversePlayback){ 
				animation.forward = true; 
				animation.frame = 1;
			} else {
				animation.frame = totalFrames-1;
			}
		}

		// Update state
		this.setState({frame: animation.frame});

		// Cancel any existing animation request
		if(animation.animReq !== null){
			cancelAnimationFrame(animation.animReq);
		}

		// Make a new animation request
		const {frame} = animation; // Declared here to stay in this scope
		animation.animReq = requestAnimationFrame(()=>{
			this.renderFrame(frame);
		});
	};
	
	// Draw frame to a canvas
	renderFrame = (frame=null, animation=this.animation, fillBG=false) => {
		if(frame === null){
			({frame} = animation);
		}
		const {canvas, image, horizontal, scale, fspan, fthick, trimR, trimL, trimU, trimD, forward, mirroring, flipping, transparent} = animation;
		const ctx = canvas.getContext("2d");
		const trimH = trimR + trimL;
		const trimV = trimU + trimD;
		const fw = (horizontal ? fspan : fthick) - trimH;
		const fh = (!horizontal ? fspan : fthick) - trimV;

		// Check if size is valid
		if(fw > 0 && fh > 0){ 
			// Resize canvas. This also clears it.
			canvas.width = fw*scale;
			canvas.height = fh*scale;
		} else {
			return;
		}

		const srcX = (horizontal ? fspan*frame : 0) + trimL;
		const srcY = (!horizontal ? fspan*frame : 0) + trimU;
		const dir = forward ? "f" : "r";
		const mirror = mirroring === "y" || mirroring === dir;
		const flip = flipping === "y" || flipping === dir;
		// Draw to canvas
		ctx.imageSmoothingEnabled = false;
		ctx.setTransform(
			mirror ? -1 : 1,
			0,
			0,
			flip ? -1 : 1,
			mirror ? canvas.width : 0,
			flip ? canvas.height : 0
		);
		if(fillBG){
			ctx.fillStyle=transparent;
			ctx.fillRect(0,0,canvas.width,canvas.height);
		}
		ctx.drawImage(image,srcX,srcY,fw,fh,0,0,canvas.width,canvas.height);
	}
	controls = {
		play: () => {
			if(this.resumeTask){
				this.setState({isPlaying: true});
				this.resumeTask();
			}
		},
		pause: () => {
			this.setState({isPlaying: false});
			clearTimeout(this.animateTask);
		},
		prev: () => {
			this.controls.pause();
			if(this.animation){
				this.animate(-1)();
			}
		},
		next: () => {
			this.controls.pause();
			if(this.animation){
				this.animate(1)();
			}
		},
		toggleplay: () => {
			if(this.state.isPlaying){
				this.controls.pause();
			} else {
				this.controls.play();
			}
		},
	}
    render() {
		return (
			<div>
				<div id="previewScreen">
					<div className="resizeable box flex flex-column justify-between mb3">
						<div className="overflow-auto flex h-100">
							<div className="canvasContainer">
								<canvas id="canvas"/>
							</div>
						</div>
						<Controller 
							controls={this.controls} 
							isPlaying={this.state.isPlaying} 
							frameCount={`${String(this.state.frame+1)}/${String(this.state.totalFrames)}`}
						/>
					</div>
				</div>
			
				<div id="uploadScreen" className="box mb3 pa3 center" onDragOver={this.onDragOver}>
					<MenuButton className="pv4">
						{this.state.isError ? (<span>Error loading image...</span>) : (<span>No image loaded.</span>)} 
						<br />
						Click to choose a file, or drag or paste here.
						
						<input className="dn"
							type="file"
							name="Choose File"
							accept=".png"
							onChange={this.props.onChooseSource}
						/>
					</MenuButton>
				</div>
				<div id="loadingScreen" className="box f3 mb3 pa4 tc center">
					Loading image...
				</div>
			</div>
		);
    }
}	


export default Preview;