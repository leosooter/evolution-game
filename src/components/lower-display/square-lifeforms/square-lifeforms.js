import React, {Component} from "react";
// import "./square-lifeforms.css";
import {world} from "../../../store/state";

class SquareLifeforms extends Component {
    state = {
        selectedLifeform: null,
        selectedNiche: null
    }

    selectedLifeform = (lifeform) => {
        this.setState({
            selectedLifeform: lifeform
        });
    }

    selectNiche = (niche) => {
        console.log('height', niche);
        this.setState({
            selectedNiche: niche
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

    renderPlants = (lifeforms) => {
        return (<ul className="plantList">
            {lifeforms.map(
            (lifeformId) =>
                {let lifeform = world.plantObj[lifeformId];
                return (<li className="" key={lifeform.id} onClick={this.selectedLifeform.bind(this, lifeform)}>
                            {lifeform.name} ~ {lifeform.survivalScore}
                        </li>)}
            )}
        </ul>)
    }

    renderAnimals = (lifeforms) => {
      return (<ul className="animalList">
          {lifeforms.map(
          (lifeformId) =>
              {let animal = world.animalObj[lifeformId];
              return (<li className="" key={animal.id}onClick={this.selectedLifeform.bind(this, animal)}>
                          {animal.name} ~ {animal.survivalScore}
                      </li>)}
          )}
      </ul>)
  }

    renderLifeforms = (lifeforms, type) => {
      if(type === "plants") {
        return this.renderPlants(lifeforms);
      } else if (type === "animals") {
        return this.renderAnimals(lifeforms);
      }
    }

    renderNiches = (niches) => {
        return (
            <ul className="nichesList">
                {niches.map(
                    (niche, height) => {
                        return (
                            <li className="niche" key={height} onClick={this.selectNiche.bind(this, niche)}>Niche {height + 1}: plants: {niche.length}</li>
                        )
                    }
                )}
            </ul>
        )
    }

    componentDidUpdate(prevProps) {
        let prevId = prevProps.selectedSquare && prevProps.selectedSquare.id;
        let currentId = this.props.selectedSquare && this.props.selectedSquare.id;
        if (prevId !== currentId && this.state.selectedLifeform) {
            this.setState({
                selectedLifeform: null
            })
        }
    }

    render() {
        const {selectedSquare} = this.props;
        if (!selectedSquare || !selectedSquare.biome) {
            return null;
        }

        const selectedBiome = world.biomes[selectedSquare.biome];
        console.log("selected Biome", selectedBiome);
        
        const plantNiches = selectedBiome.plantNiches;
        const animals = selectedBiome.animals;        
        const selectedLifeform = this.state.selectedLifeform;
        const selectedNiche = this.state.selectedNiche;
        let ancestor = "None"
        if(selectedLifeform && selectedLifeform.ancestor) {
            ancestor = world.plantObj[selectedLifeform.ancestor].name
        }

        return (
            <div className="lifeformDisplayWrapper">
                {/* {animals && <div className="animals">
                    Animals
                    {this.renderLifeforms(animals, "animals")}
                </div>} */}

                {plantNiches && <div className="plants">
                    {this.renderNiches(plantNiches, "plant")}
                </div>}

                {selectedNiche && this.renderLifeforms(selectedNiche, "plants")}

                {selectedLifeform && <div className="plantDetails">
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
