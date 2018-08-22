import React from "react";

const IconButton = (props) => {
    return (
        <div className={"iconButton " + props.className} title={props.title}>
            <ion-icon name={props.name} onClick={props.onClick}/>
        </div>
    )
}
export default IconButton;