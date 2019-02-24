import React, {Component} from "react";
import "./world-colors.css";

class WorldColors extends Component {

    renderColors = () => {
        console.log('renderColors', this.props);

        const colorsGrid = this.props.worldColorsGrid || [];
        let returnArray = [];

        if(colorsGrid.length) {
            for (let i = 0; i < colorsGrid.length; i++) {
                const row = colorsGrid[i];
                let returnRow = [];

                for (let j = 0; j < row.length; j++) {
                    const color = row[j];
                    const colorStyle = {
                        background: `rgb(${color.r}, ${color.g}, ${color.b})`
                    }

                    returnRow.push(<div className="color" style={colorStyle}></div>)
                }

                returnArray.push(<div className="colorRow">{returnRow}</div>);
            }
        }

        return returnArray;
    }

    render() {
        return (
            <div className="colors-wrapper">
                {this.renderColors()}
            </div>
        )
    }
}

export default WorldColors;
