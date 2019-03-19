import React, {Component} from "react";
import "./square-lifeforms.css";
import { world } from "../../../store/state";

class SquareLifeforms extends Component {
    state = {
        selectedLifeform: null
    }

    selectedLifeform = (lifeform) => {
        this.setState({
            selectedLifeform: lifeform
        });
    }

    renderFoliageLayer = (layerWidth) => {
        const layerStyle = {
            width: `${layerWidth * 5}px`,
            height: "30px",
            backgroundColor: "OliveDrab"
        }
        return (<div className="leafLayer" style={layerStyle}></div>);
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
        const selectedPlant = this.state.selectedLifeform;

        if (selectedPlant.foliageProfile.length > 0 && selectedPlant.rootProfile.length) {
            return (
                <div className="plantProfile">
                    {selectedPlant.foliageProfile.map(this.renderFoliageLayer)}
                    {selectedPlant.rootProfile.map(this.renderRootLayer)}
                </div>
            );
        }

        return null;
    }

    renderLifeforms = (lifeforms) => {
        return lifeforms.map(
            (lifeformObj) =>
            {
                let lifeform = world.plantObj[lifeformObj.plantId];
                return (<div className="lifeform" onClick={this.selectedLifeform.bind(this, lifeform)}>
                    {lifeform.name} ~ {lifeform.survivalScore}
                </div>)
            }
        )
    }

    componentDidUpdate(prevProps) {
        if (prevProps.selectedSquare && prevProps.selectedSquare.id !== this.props.selectedSquare.id && this.state.selectedLifeform) {
            this.setState({
                selectedLifeform: null
            })
        }
    }

    render() {
        if (!this.props.selectedSquare) {
            return null;
        }

        const plants = this.props.selectedSquare.plants;
        const animals = this.props.selectedSquare.animals;
        const selectedLifeform = this.state.selectedLifeform;
        let ancestor = "None"
        if(selectedLifeform && selectedLifeform.ancestor) {
            ancestor = world.plantObj[selectedLifeform.ancestor].name
        }

        return (
            <div className="lifeformDisplayWrapper">
                {plants && <div className="plants">
                    {this.renderLifeforms(plants, "plant")}
                </div>}

                {animals && <div className="animals">
                    {this.renderLifeforms(animals, "animal")}
                </div>}

                {selectedLifeform && <div>
                    <p><strong>{selectedLifeform.name}</strong> <em>{selectedLifeform.solarRatio}</em></p>
                    <p>Min Precip: {selectedLifeform.minPrecip}</p>
                    <p>Drought Tolerance: {selectedLifeform.droughtTolerance}</p>
                    <p>Min Temp: {selectedLifeform.minTemp}</p>
                    <p>Strength {selectedLifeform.foliageStrength}</p>
                    <p>Ancestor {ancestor}</p>
                </div>}

                {selectedLifeform && <div>
                    {this.renderPlantProfile()}
                </div>}
            </div>
        )
    }
}

export default SquareLifeforms;
