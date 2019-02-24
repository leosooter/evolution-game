import React, {Component} from 'react';
import './environment.css';

function generateTree(precipitation) {
    const diameter = precipitation;
    const yCoord = 100;
    const xCoord = 100;

    return {
        yCoord,
        xCoord,
        diameter,
        color: "green"
    }
}

function generateTreeMap(props) {
    const treeMap = [];

    if(!props) {
        return treeMap;
    }

    const numTrees = Math.floor(props.precipitation / 3);

    for (let index = 0; index < numTrees; index++) {
        treeMap.push(generateTree(props.precipitation));
    }

    return treeMap;
}

class Environment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            treeMap: generateTreeMap(this.props)
        }
    }

    renderTrees = () => {
        const treeArray = this.state.treeMap.map(
            (tree) => {

                const treeStyle = {
                    top: `${tree.yCoord}px`,
                    left: `${tree.xCoord}px`,
                    height: `${tree.diameter}px`,
                    width: `${tree.diameter}px`,
                    background: tree.color,
                };

                return (<div className="tree" style={treeStyle}></div>);
            }
        );

        return treeArray;
    }

    render () {
        const {color} = this.props;
        const backgroundColor = color.r && {
            background: `rgb(${color.r}, ${color.g}, ${color.b})`
        }

        return (
            <div className="environmentWrapper">
                <div className="environmentInfo">
                    <h5>Environment</h5>
                    <div className="environmentStat">precipitation: <em>{this.props.precipitation}</em></div>
                    <div className="environmentStat">Average Elevation: <em>{this.props.avgElevation}</em></div>
                    {/* <div className="environmentStat">Elevation Change: <em>{this.props.elevationChange}</em></div> */}
                    <div className="environmentStat">Base Temperature: <em>{this.props.baseTemp}</em></div>
                    <div className="environmentStat">
                        R: <em>{color.r} |</em>
                        G: <em>{color.g} |</em>
                        B: <em>{color.b} |</em>
                    </div>
                </div>
                <div className="environmentMap" style={backgroundColor}>
                    {/* {this.renderTrees()} */}
                </div>
            </div>

        )
    }
}

export default Environment;
