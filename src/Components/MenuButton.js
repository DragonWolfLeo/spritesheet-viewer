import React from "react";

class MenuButton extends React.Component {
	constructor(props){
		super(props);
		this.label = React.createRef();
	}
	componentDidMount(){
		const cl = this.label.current.classList
		if(this.props.color){
			cl.add(...this.props.color);
		} else {
			cl.add("bg-near-black", "hover-bg-dark-gray");
		}
	}
	render(){
		const {htmlFor, onClick, cursor, children, className, title} = this.props;
		return (
			<label 
				ref={this.label} 
				htmlFor={htmlFor} 
				onClick={onClick}
				title={title}
				style={{cursor: cursor || "pointer"}} 
				className={className+" br1 ba bw1 b--black dib white w-100 bg-animate"}
			>
				<div className="tc f4">
					{children}
				</div>
			</label>
		)
	}
}


export default MenuButton;