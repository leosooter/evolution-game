import React, {Component} from "react";
// import "./controls.css";

class Controls extends Component {

    renderAnimalOptions = () => {
      let animals = world.animalObj;

      if(!animals) {
        return null;
      }
      let returnArray = [];

      for (const animalId in animals) {
        if (object.hasOwnProperty(animalId)) {
          const animal = animals[animalId];
          returnArray.push(<option value={animal}>{animal.name}</option>);
        }
      }

      return (
        <select>{returnArray}</select>
      )
    }

    render() {
        return (
            <div className="controlsWrapper">
                <div className="controlColumn">
                    <button className="controlButton" onClick={this.props.evolveOrganisms}>
                        Evolve Organisms
                    </button>

                    <button className="controlButton" onClick={this.props.addAnimals}>
                        Add Animals
                    </button>

                    <button className="controlButton" onClick={this.props.changeView.bind(this, {view: "elevation"})}>
                        Elevation
                    </button>

                    <button className="controlButton" onClick={this.props.changeView.bind(this, {view: "temperature"})}>
                        Temperature
                    </button>

                    <button className="controlButton" onClick={this.props.changeView.bind(this, {view: "rainfall"})}>
                        Rainfall
                    </button>

                    <button className="controlButton" onClick={this.props.changeView.bind(this, {view: "groundColor"})}>
                        Biomes
                    </button>

                    <button className="controlButton" onClick={this.props.changeView.bind(this, {view: "gridColor"})}>
                        Vegetation
                    </button>

                    {/* {this.renderAnimalOptions()} */}

                    {/* <button className="controlButton" onClick={this.props.reapplyOrganisms}>
                        Reapply Organisms
                    </button>

                    <button className="controlButton" onClick={this.props.applyInitialRain}>
                        Initial Rain
                    </button>

                    <button className="controlButton" onClick={this.props.applyYearlyRain}>
                        Yearly Rain
                    </button>

                    <button className="controlButton" onClick={this.props.applySeasonsRain}>
                        Season's Rain
                    </button> */}
                </div>

                <div className="controlColumn">
                    <button className="controlButton" onClick={this.props.advanceSeason}>
                        Advance Season
                    </button>

                    <button className="controlButton" onClick={this.props.increaseMoisture}>
                        Increase Moisture
                    </button>

                    <button className="controlButton" onClick={this.props.decreaseMoisture}>
                        Decrease Moisture
                    </button>

                    <button className="controlButton" onClick={this.props.toggleZoom}>
                        Toggle Zoom
                    </button>
                </div>

            </div>
        )
    }
}

export default Controls;
