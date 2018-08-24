import React from "react";
import MenuButton from "./MenuButton.js";

const About = ({loadDemo}) => {
    const menuButtonClassName = "white f3 h2 mb2 pv2 flex items-center justify-center"
	return (
		<div className="flex flex-wrap justify-center mv4">
            <div className="w-100 mb3 mh3 flex flex-wrap justify-center" style={{flex: "2 0 50%"}}>
                <p className="tj mb3" style={{flex: "2 0 60%"}}>
                    This is a tool designed to assist sprite animators. It takes either horizontal or vertical spritesheet and displays it as an animation, as well as providing an option to export to a GIF.
                </p>
                <div className="flex flex-column justify-center mh3">
                    <h3 className="tc w-100 mv0">Tools Used</h3>
                    <ul>
                        <li><a href="https://reactjs.org/">React.js</a></li>
                        <li><a href="https://github.com/facebook/create-react-app#readme">Create React App</a></li>
                        <li><a href="http://jnordberg.github.io/gif.js/">Gif.js</a> - GIF encoding</li>
                        <li><a href="http://tachyons.io/">Tachyons</a> - CSS</li>
                        <li><a href="https://ionicons.com/">Ionicons</a> - Icons</li>
                    </ul>
                </div>
            </div>
            <div className="flex flex-column ph4">
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