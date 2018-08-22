import React from "react";
import MenuButton from "./MenuButton.js";

const About = ({loadDemo}) => {
    const menuButtonClassName = "white f3 h2 mb2 pv2 flex items-center justify-center"
	return (
		<div>
            <p>
                This is a tool designed to assist sprite animators. It takes either horizontal or vertical spritesheet and displays it as an animation, as well as providing an option to export to a GIF. This was coded in <a href="https://reactjs.org/">React.js</a> using <a href="https://github.com/facebook/create-react-app#readme">Create React App</a>. It also uses <a href="http://jnordberg.github.io/gif.js/">Gif.js</a> for GIF export, <a href="http://tachyons.io/">Tachyons</a> for CSS, and icons from <a href="https://ionicons.com/">Ionicons</a>.
            </p>
            <div className="flex flex-wrap ph4">
                <div className="w5 center">
                    <a href="https://github.com/DragonWolfLeo/spritesheet-viewer">
                        <MenuButton className={menuButtonClassName}>
                            <ion-icon name="logo-github" />
                            <span className="pl2">View on GitHub</span>
                        </MenuButton>
                    </a>
                </div>
                <div className="w5 center">
                    <MenuButton className={menuButtonClassName} onClick={loadDemo}>
                        <span className="pl2">Load a Demo</span>
                    </MenuButton>
                </div>
            </div>
		</div>
		
	);
}

export default About;