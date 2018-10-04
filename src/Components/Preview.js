import React from "react";
import Controller from "./Controller";
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
		this.loadImage = null;
		this.lockedParams = {
			scale: 2,
			delay: 33,
			transparent: "#FF00FF",
		}
		this.mode = "auto";

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
		const {canvas} = this.refs;
		const image = new Image();
		image.src = imagesrc;
		this.loadImage = (newMode = null) => () => {
			this.props.setImageLoaded();
			this.screens.changeTo("preview");

			// Determine whether the sprite sheet is horizontal or vertical
			const {width: w, height: h} = image;
			const horizontal = this.mode === "auto" ? w > h : this.mode === "horizontal";

			// If setting a new mode but has same orientation, cancel
			if(newMode){
				if(horizontal === this.animation.horizontal){
					return;
				}
			}

			// Init animation
			const a = {
				filename,
				frame: 0,
				prevFrame: -1,
    			image,
				canvas,
				horizontal,
				fspan: w > h ? h : w,
				fspan_max: horizontal? w : h,
				fthick: horizontal ? h : w,
				srclength: horizontal ? w : h,
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
			Object.assign(a,this.lockedParams);

			// Update parameters as well as syncing locked params
			if(this.props.updateParameters){
				this.props.updateParameters(a, this.lockedParams);
			}

			this.animation = a;
			const totalFrames = this.calcTotalFrames(a);

			this.createAnimateTask(this.animate());
			this.setState({
				totalFrames,
				isError: false,
				horizontal,
			});
		}
		image.onload = this.loadImage(null);
		image.onerror = () => {
			clearTimeout(this.animateTask);
			this.props.setImageLoaded(false);
			this.setState({isError: true});
			this.screens.changeTo("upload");
		};
	}
	
	calcTotalFrames = (a = this.animation) => {
		const {srclength, fspan} = a;
		const totalFrames = Math.ceil(srclength/fspan);
		return a.totalFrames = totalFrames;
	}

	// Called by Parameters to set new mode
	setMode = (newMode) => {
		if(this.mode !== newMode){
			this.mode = newMode;
			if(this.loadImage){
				this.loadImage(newMode)();
			}
		}
	}

	// Called by Parameters to set new settings
	setNewProps = (props) => {
		const a = this.animation;
		Object.entries(props).forEach(item => {
			a[item[0]] = item[1];
			if(this.lockedParams[item[0]] !== undefined){
				this.lockedParams[item[0]] = item[1];
			}
		});

		// Update frame count if frame span or trim is changed
		if(props.fspan || props.horizontal){
			a.frame = 0;
			const totalFrames = this.calcTotalFrames(a);
			this.setState({totalFrames});
		}
		
		// Update the frame
		this.animate(0, true)();
	}

	// Called by Parameters to lock or unlock a parameter
	lockParam = (prop, lock) => {
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
    animate = (frameAdvance = null, forceUpdate = false) => () => {
		const {animation: a} = this;
		const {playback, totalFrames} = a;
		switch(playback){
			default:
				break;
			case "r":
				a.forward = false;
				break;
			case "f":
				a.forward = true;
		}

		// Update frame counter
		a.frame += frameAdvance === null ? ( a.forward ? 1 : -1) : frameAdvance;
		// Loop over if past range
		const reversePlayback = frameAdvance === null && playback === "b";
		if(a.frame >= totalFrames){
			if(reversePlayback){ 
				a.forward = false; 
				a.frame = totalFrames-2;
			} else {
				a.frame = 0;
			}
		}else if(a.frame < 0){
			if(reversePlayback){ 
				a.forward = true; 
				a.frame = 1;
			} else {
				a.frame = totalFrames-1;
			}
		}

		// Update state
		this.setState({frame: a.frame});

		// Make a new animation request
		const {frame, prevFrame} = a; // Declared here to stay in this scope
		if(frame !== prevFrame || forceUpdate){
			a.prevFrame = frame;
			// Cancel any existing animation request
			if(a.animReq !== null){
				cancelAnimationFrame(a.animReq);
			}
			a.animReq = requestAnimationFrame(()=>{
				this.renderFrame(frame);
			});
		}
	};
	
	// Draw frame to a canvas
	renderFrame = (frame=null, a=this.animation, fillBG=false) => {
		if(frame === null){
			({frame} = a);
		}
		const {
			canvas, 
			horizontal: hz, 
			scale, 
			fspan, 
			fthick, 
			trimR, 
			trimL, 
			trimU, 
			trimD, 
			forward, 
			mirroring, 
			flipping,
		} = a;
		const ctx = canvas.getContext("2d");
		const fw = (hz ? fspan : fthick) - (trimR + trimL);
		const fh = (!hz ? fspan : fthick) - (trimU + trimD);

		// Check if size is valid
		if(fw > 0 && fh > 0){ 
			// Resize canvas. This also clears it.
			canvas.width = fw*scale;
			canvas.height = fh*scale;
		} else {
			return;
		}

		const srcX = (hz ? fspan*frame : 0) + trimL;
		const srcY = (!hz ? fspan*frame : 0) + trimU;
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
			ctx.fillStyle=a.transparent;
			ctx.fillRect(0,0,canvas.width,canvas.height);
		}
		ctx.drawImage(a.image,srcX,srcY,fw,fh,0,0,canvas.width,canvas.height);
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
								<canvas ref="canvas"/>
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