import React from "react";
import MenuButton from "./MenuButton.js";

const About = () => {
	return (
		<div>
            <p>
                This is a tool designed to assist sprite animators. It takes either horizontal or vertical spritesheet and displays it as an animation, as well as providing an option to export to a GIF. This was coded in <a href="https://reactjs.org/">React.js</a> using <a href="https://github.com/facebook/create-react-app#readme">Create React App</a>. It also uses <a href="http://jnordberg.github.io/gif.js/">Gif.js</a> for GIF export, <a href="http://tachyons.io/">Tachyons</a> for CSS, and icons from <a href="https://ionicons.com/">Ionicons</a>.
            </p>
            <div className="w5 center">
                <a href="https://github.com/DragonWolfLeo/spritesheet-viewer">
                    <MenuButton className="white f3 pa2">
                        <ion-icon name="logo-github" />
                        <span className="pl2">View on GitHub</span>
                    </MenuButton>
                </a>
            </div>
		</div>
		
	);
}

export default About;