import React from "react";
import IconButton from "./IconButton";

class Parameters extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            lockedParams: {},
        }
        
        this.paramsList = ["filename","scale","delay","fps","fspan","trimR","trimL","trimU","trimD","playback","mirroring","flipping","transparent","horizontal"];
        this.lockedParams = {};
        // Create a list of functions that can be synced with each parameter input
        this.updateFnList = {};
        this.paramsList.forEach(item=>{
            this.updateFnList[item] = this.updateInput(item);
        });
    }

    // Called by preview to sync settings with parameters
    updateParameters = (animation, lockedParams) => {
        if(lockedParams){
            this.setState({lockedParams: lockedParams});
        }
        if(animation){
            Object.keys(animation).forEach(item=>{
                if(this.updateFnList[item]){
                    this.updateFnList[item](
                        animation[item],
                        animation[item+"_max"] ? animation[item+"_max"] : null,
                    );
                }
            });
        }
    }

    // Creates a function to update an input parameter
    updateInput = name => {
        const resultValue = name === "delay" ? (value => Math.round(1000/value)) : (value => value);
        name = name === "delay" ? "fps" : name;
        return (value, max = null) =>{
            const input = document.getElementById(`${name}Input`);
            if(input){
                input.value = resultValue(value);
                if(max !== null) {
                    input.max = max;
                }
            }
        }
    }

    // Forces a number into the valid range
    onInvalidNum = (fn) => {
        return (event) => {
            // Convert values to numbers
            const o = event.target;
            const value = Number(o.value) || 0;
            const min = Number(o.min) || 0;
            const max = Number(o.max);
            // Clamp to input range
            o.value = value < min ? min : (value > max ? max : value);
            fn(event);
        }
    }

    // Mode select input change event
    onModeChange = (event) => {
        this.props.preview.current.setMode(event.target.value);
    }

    // Default input change event
    onDefaultChange = (prop) => {
        return event => {
            const o = {};
            o[prop] = event.target.value;
            this.props.preview.current.setNewProps(o);
        }
    }

    // Number input change event
    onNumberChange = (prop) => {
        return event => {
            if(event.target.validity.valid) {
                const o = {};
                o[prop] = Number(event.target.value);
                this.props.preview.current.setNewProps(o);
            }
        }
    }

    // Number input change event for fps
    onDelayChange = (event) => {
        if(event.target.validity.valid) {
            this.props.preview.current.setNewProps({delay: 1000/event.target.value});
        }
    }

    // Template for creating a parameter row
    createParam(label,id,field,special = "lock"){
        const locked = this.state.lockedParams[id] !== undefined;
        let specialBtn = null;
        let specialOnClick = null;
        switch(special){
            case "lock":
                specialBtn = (<IconButton 
                    className={locked ? "paramIconButton" : "paramIconButtonOff"}
                    name={locked ? "lock" : "unlock"}
                    title="Prevent from changing when loading a new image"                      
                />)
                specialOnClick = () => {
                    // Toggle lock
                    const lockedParams = this.props.preview.current.lockParam(id, this.state.lockedParams[id] === undefined);
                    this.setState({lockedParams: lockedParams});
                }
                break;
            case "color":
                specialBtn = (<IconButton 
                    className="paramIconButton"
                    name="color-filter"
                    title="Pick a color from the image"              
                />)
                specialOnClick = this.props.pickColor;
                break;
            default:
                specialBtn = null;
        }
        return (
            <tr className="stripe-light" key={id || label}>
                <td style={{whiteSpace:"nowrap"}}>
                    <span className="mr2">{label}</span>
                </td>
                <td>
                    {field}
                </td>
                <td onClick={specialOnClick}>
                  {specialBtn}
                </td>
            </tr>
        );
    }
    // Template for creating an input parameter row
    createInput(label, id, props, special){
        return (
            this.createParam(label, id, (
                <div className="w-100">
                    <input 
                        id={id+"Input"} 
                        className={props.type === "checkbox" ? "" : "w-100"} 
                        {...props}
                    />
                </div>
            ), special)
        );
    }
    // Template for creating an select parameter row
    createSelect(label, id, props, options, special){
        return (
            this.createParam(label, id, (
                <select id={id+"Input"} className="w-100" {...props}>
                    {
                        Object.entries(options).map(entry=>{
                            return (<option key={entry[0]} value={entry[0]}>{entry[1]}</option>)
                        })
                    }
                </select>
            ), special)
        );
    }
	render() {
        return (
			<table className="mb3 w-100 bg-black-60">
                <tbody>
                    {[
                        this.createSelect("Mode", "mode",
                        {
                            onChange: this.onModeChange,
                        },
                        {
                            auto: "Auto",
                            horizontal: "Horizontal",
                            vertical: "Vertical",
                        }, null),
                        this.createInput("Name", "filename",
                        {
                            type: "text",
                            defaultValue: "Untitled",
                            onChange: this.onDefaultChange("filename"),
                        }),
                        this.createInput("Scale", "scale",
                        {
                            type: "number",
                            min: "1",
                            max: "10",
                            defaultValue: "2",
                            onChange: this.onNumberChange("scale"),
                            onBlur: this.onInvalidNum(this.onNumberChange("scale")),
                        }, null),
                        this.createInput("FPS", "fps",
                        {
                            type: "number",
                            min: "1",
                            max: "60",
                            defaultValue: "30",
                            onChange: this.onDelayChange,
                            onBlur: this.onInvalidNum(this.onDelayChange),
                        }, null),
                        this.createInput("Frame Distance", "fspan",
                        {
                            type: "number",
                            min: "1",
                            defaultValue: "30",
                            onChange: this.onNumberChange("fspan"),
                            onBlur: this.onInvalidNum(this.onNumberChange("fspan")),
                        }),
                        ["Right", "Left", "Up", "Down"].map(item=>{
                            const initial = item.substr(0,1);
                            return this.createInput(`Trim ${item}`, `trim${initial}`,
                            {
                                type: "number",
                                min: "0",
                                defaultValue: "0",
                                onChange: this.onNumberChange(`trim${initial}`),
                            })
                        }),
                        this.createSelect("Playback", "playback",
                        {
                            onChange: this.onDefaultChange("playback"),
                        },
                        {
                            f: "Forward",
                            r: "Reversed",
                            b: "Both",
                        }),
                        ["Mirroring", "Flipping"].map(item=>{
                            const lower = item.toLowerCase();
                            return this.createSelect(item, lower,
                            {
                                onChange: this.onDefaultChange(lower),
                            }, 
                            {
                                n: "No",
                                y: "Yes",
                                f: "When forward",
                                r: "When reversed",
                            })
                        }),
                        this.createInput("Transparent", "transparent",
                        {
                            type: "color",
                            defaultValue: "#FF00FF",
                            onChange: this.onDefaultChange("transparent"),
                        }, "color"),
                       
                    ]}
                </tbody>
			</table>
        );
    }
}

export default Parameters;