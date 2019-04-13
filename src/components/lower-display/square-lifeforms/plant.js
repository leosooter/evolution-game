import React, {Component} from "react";
import {round} from "lodash";
import {random} from "../../../helpers/utilities";
import {morphColorStyle} from "../../../helpers/color-helpers";

class Plant extends Component {



    renderFolageGrid = (layerWidth, layerNumber) => {
        const {foliageColor, foliageSize, hasFlowers, flowerColor, flowerDensity, trunkColor, trunkSize, height} = this.props.plant;
        const layerHeightTarget = 30;
        let trunk = false;
        let trunkHeight = round(height / 5);

        if(trunkHeight && height - layerNumber <= trunkHeight) {
            trunk = true;
        }

        let layerPixelWidth = layerWidth * 5;

        let grid = [];
        let layerHeight = round(layerHeightTarget / foliageSize);
        let width = round(layerPixelWidth / foliageSize);

        for (let heightIndex = 0; heightIndex < layerHeight; heightIndex++) {
            const row = [];
            for (let widthIndex = 0; widthIndex < width; widthIndex++) {
                let leafColor = morphColorStyle(foliageColor, 30);
                let barkColor = morphColorStyle(trunkColor, 20);
                let randFlowerColor = hasFlowers && morphColorStyle(flowerColor, 10);
                let leafRadius = "0%";


                let middle = round(width / 2);

                let percentFromMiddle = round(Math.abs(widthIndex - middle) / middle, 2);
                let distFromTop = (layerNumber + 1) * layerHeight - (layerHeight - heightIndex + 1);
                let percentFromTop = round(distFromTop / (height * layerHeight), 2);

                if(trunk) {
                    leafColor = barkColor;
                    leafRadius = "0%";
                } else {
                    if(hasFlowers && random(1,flowerDensity) === 1) {
                        leafColor = randFlowerColor;
                    } else if (random(.6, 1) < percentFromMiddle && random(1, 100) > 70) {
                        leafColor = "white";
                    }

                    if (random(.1, 1) > percentFromMiddle && random(.1, 1) < percentFromTop && random(1, 100) > 80) {
                        leafColor = barkColor;
                    }

                    if (random(0, .3) >= percentFromMiddle && random(.75, 1) < percentFromTop) {
                        leafColor = barkColor;
                    }
                }

                const leafStyle = {
                    borderRadius: leafRadius,
                    width: `${foliageSize}px`,
                    height: `${foliageSize * 1}px`,
                    backgroundColor: leafColor,
                    display: "inline-block"
                }

                const leaf = (<div className="leaf" style={leafStyle} key={`${heightIndex}-${widthIndex}`}></div>);
                row.push(leaf);
            }

            grid.push(<div className="plantGridRow">{row}</div>);
        }

        return (<div className="foliageLayer">{grid}</div>);
    }


    renderFoliageLayer = (layerWidth, index) => {
        const {foliageColor, foliageSize, foliageDensity, trunkColor, trunkSize} = this.props.plant;
        const layerStyle = {
            width: `${layerWidth * 5}px`,
            height: "30px",
            backgroundColor: foliageColor
        }
        return (this.renderFolageGrid(layerWidth, index));
    }

    renderRootLayer = (layerWidth) => {
        const layerStyle = {
            width: `${layerWidth * 5}px`,
            height: "30px",
            backgroundColor: "Sienna"
        }
        return (<div className="rootLayer" style={layerStyle}></div>);
    }

    renderPlantProfile = () => {
        const selectedPlant = this.props.plant;

        if (selectedPlant.foliageProfile.length > 0 && selectedPlant.rootProfile.length) {
            return (
                <div className="plantProfile">
                    {selectedPlant.foliageProfile.map(this.renderFoliageLayer)}
                    <div className="groundLine"></div>
                    {selectedPlant.rootProfile.map(this.renderRootLayer)}
                </div>
            );
        }

        return null;
    }

    render() {
        return (<div>{this.renderPlantProfile()}</div>);
    }
}

export default Plant;
