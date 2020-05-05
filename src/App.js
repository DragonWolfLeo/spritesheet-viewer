import React, { Component } from 'react';
import GIF from "gif.js.optimized";
import "tachyons";
import './CSS/App.css';
import Preview from "./Components/Preview.js";
import Parameters from "./Components/Parameters.js";
import MenuButton from "./Components/MenuButton";
import ColorPicker from "./Components/ColorPicker";
import About from './Components/About.js';


class App extends Component {
  constructor(){
    super();
    this.state = {
      imageLoaded: false,
      exporting: false,
      progress: 0,
    }
    this.progressTask = null;
    this.preview = React.createRef();
    this.parameters = React.createRef();
    this.colorPicker = React.createRef();
    
    // Add drag and drop functionality
    window.ondragover = event => {
      event.preventDefault();
    }
    window.ondrop = event => {
      // Prevent file from being opened
      event.preventDefault();
      this.readDataTransfer(event.dataTransfer);
    };

    // Allow pasting image data into the app
    const body = document.querySelector("body");
    body.onpaste = event => {
      this.readDataTransfer(event.clipboardData);
		}
		body.onkeypress = event => {
			if(event.target !== body){
				return;
			}
			const {controls} = this.preview.current;
			switch(event.key){
				default:
					break;
				case ",":
					controls.prev();
					break;
				case ".":
					controls.next();
					break;
				case " ":
					event.preventDefault();
					controls.toggleplay();
			}
		}
  }
  // Function to remove .png from a string
  removePngExtension = str => str.substr(str.length-4) === ".png" ? str.substr(0,str.length-4) : str;

  readDataTransfer = dataTransfer => {    
    const files = dataTransfer.files
    if (files && files[0] && files[0].type === "image/png") {
      const filename = this.removePngExtension(files[0].name)
      // Read image files
      const reader = new FileReader();
      reader.onload = event => {
        this.preview.current.setImage(event.target.result, filename);
      }
      reader.readAsDataURL(dataTransfer.files[0]);
    }
  }
  onChooseSource = event => {
    this.readDataTransfer(event.target);
  }
  // For setting image to not loaded when an invalid image is submitted
  setImageLoaded = (val = true) => {
    this.setState({imageLoaded: val});
  }
  // Gif Export
  exportGIF = () => {
    if(this.state.exporting){
      // Cancel current progress
      if(this.gif){
        this.gif.abort();
        this.closeExport();
      }
      return;
    }

    this.setState({exporting: true});

    // Make dots on progress indicator
    this.progressTask = setInterval(()=>{
      const {progress} = this.state;
      this.setState({
        progress: progress >= 3 ? 0 : progress + 1
      });
    }, 800);


    const {animation, renderFrame} = this.preview.current;
    const {exportCanvas: canvas} = this.refs;
    const a = Object.assign({}, animation, {canvas}); // Make new animation for exportCanvas

    const gif = new GIF({
      workers: 4,
      workerScript: `${process.env.PUBLIC_URL}/gif.js/gif.worker.js`,
      quality: 1,
      transparent: Number("0x"+a.transparent.substr(1)),
    });
    this.gif = gif;

    // Render frames
    a.alt = false;
    let doubleRender = a.mirroring === "a" || a.flipping === "a"; // Render twice for alternating
    for(let renders = 0; renders < (doubleRender ? 2 : 1); renders++){
      let i = a.playback === "r" ? a.totalFrames-1 : 0;
      a.forward = a.playback !== "r";
      do {
        renderFrame(i,a, true);
        gif.addFrame(canvas, {copy: true, delay: a.delay}); // Copy pixels from canvas
        i += a.forward ? 1 : -1;
        if(i >= a.totalFrames && a.playback === "b" ){
            a.forward = false; 
            i = a.totalFrames-2;
        }

      } while(a.playback === "f" ? i < a.totalFrames : i > 0 );
      a.alt = ! a.alt;
    }

    gif.on('finished', blob => {
      this.download(blob, `${a.filename || "untitled" }.gif`);
      this.closeExport();
    });
    
    gif.render();
  }
  closeExport = () => {
    this.setState({
      exporting: false,
      progress: 0,
    });
    this.gif = null;
    clearInterval(this.progressTask);
  }
  // Function to download data to a file
  download = (file, filename) => {
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
  }
  // Show color picker
  pickColor = () => {
    this.colorPicker.current.show();
  }
  loadDemo = () => {
    this.preview.current.setImage("./demo/demo.png", "demo");
  }
  render() {
    return (
      <div className="App">
        <header className="dib w-100 mb3 ph3 shadow-1">
          <h1>Spritesheet Viewer</h1>
        </header>
        <main className="pt3 ph3 flex">
          <div className="w-100 overflow-hidden">
					<Preview 
						ref={this.preview} 
						setImageLoaded={this.setImageLoaded} 
						onChooseSource={this.onChooseSource} 
						onDrop={this.onDrop}
						updateParameters={(...props)=>{
							this.parameters.current.updateParameters(...props);
						}}
					/>
          {this.state.imageLoaded ? null : <About loadDemo={this.loadDemo}/>}
          </div>
          {
            this.state.imageLoaded ? 
            (<div id="controlPanel" className="ml3 mb3 w-100" >
              <div className={"box pa3"}>
                <Parameters ref={this.parameters} preview={this.preview} pickColor={this.pickColor}/>
                <MenuButton className="mb1 pv2" htmlFor="fileInput">Choose a file</MenuButton>
                <MenuButton className="mb1 pv2" 
                  cursor={this.state.exporting ? "progress" : null } 
                  onClick={this.exportGIF} color={["bg-dark-blue", "hover-bg-blue"]}
                  title={this.state.exporting ? "Click to abort" : null}
                >
                  {this.state.exporting ? 
                    "Processing"+".".repeat(this.state.progress):
                    "Export GIF"
                  }
                </MenuButton>
              </div>
            </div>) :
            (null)
          }
        </main>
         {/*Hidden Elements*/}
        <ColorPicker ref={this.colorPicker} preview={this.preview} parameters={this.parameters}/>
        <div className="dn">
          <input 
            id="fileInput"
            type="file"
            name="Choose File"
            accept=".png"
            onChange={this.onChooseSource}
          />
          <canvas ref="exportCanvas" />
        </div>
      </div>
    );
  }
}

export default App;
