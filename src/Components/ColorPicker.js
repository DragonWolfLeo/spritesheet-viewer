import React from "react";

class ColorPicker extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            visible: false,
        }
    }
    show = () => {
        // Show the component
        this.setState({visible: true});
        const canvas = document.getElementById("pickerCanvas");
        
        // Render current frame onto the canvas
        const {animation, renderFrame} = this.props.preview.current;
        const a = Object.assign({}, animation, {canvas: canvas});
        renderFrame(a.frame,a,true);
    }
    hide = () => {
        // Hide the component
        this.setState({visible: false});
    }
    onCanvasClick = event => {
        // Get mouse location
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.x;
        const y = event.clientY - rect.y;

        // Pick color from canvas
        const ctx = event.target.getContext("2d");
        const [r,g,b] = ctx.getImageData(x,y,1,1).data;
        const color = this.colorStr(r,g,b);

        // Set the color
        const o = {transparent: color};
        this.props.parameters.current.updateParameters(o);
        this.props.preview.current.setNewProps(o);
    }
    // Convert rgb into a color string
    colorStr = (...bytes) => {
        return bytes.reduce((acc,num) => acc + num.toString(16).padStart(2,"0") , "#");
    }
    render() {
        return (
            <div className={this.state.visible ? "" : "dn"} onClick={this.hide}>
                <div id="overlay"/>
                <div id="colorPicker" className="ph3">
                    <div className="w-100 h-100 flex justify-center">
                        <div className="overflow-auto flex h-100">
                            <div className="canvasContainer">
                                <canvas id="pickerCanvas" onClick={this.onCanvasClick}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default ColorPicker;