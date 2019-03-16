import React from 'react';
import ReactDOM from 'react-dom';
import {random, sample, compact, cloneDeep} from "lodash";

import Animal from "./components/main-display/organisms/animals/animal";
import Controls from "./components/main-display/organisms/animals/controls";
import {generateNewAnimal, generateDefinedAnimal, generateTraitsEvolvedAnimal} from "./helpers/animal-helpers/generate-new-animal";
import {evolveAnimalForTrait, randomEvolveAnimal} from "./helpers/animal-helpers/evolve-animal";
import {weightedChance} from './helpers/animal-helpers/calculate.js';
import getNewEnvironment from './helpers/animal-helpers/generate-environment';
import "./animal-app.css";

class AnimalApp extends React.Component {
  constructor(){
    super();
    this.state = {
      animals: [],
      environment: {}
    }
  }

  handleTestClick = () => {

  }

  handleClearClick = () => {
    this.setState({
      animals: []
    })
  }

  handleNewAnimalClick = () => {
    let newAnimals = cloneDeep(this.state.animals);

    newAnimals.push(generateNewAnimal());

    this.setState({
      animals: newAnimals
    })
  }

  // handleDefinedAnimalClick = () => {
  //   let newAnimals = cloneDeep(this.state.animals);

  //   let template = {
  //     bodyLength: 165,
  //     bodyHeight: 43,
  //     legLength: 124,
  //     legWidth: 14,
  //     headLength: 65,
  //     headHeight: 42
  //   }

  //   newAnimals.push(generateDefinedAnimal(template));

  //   this.setState({
  //     animals: newAnimals
  //   })
  // }


  handleEvolveForTraitsClick = (traits) => {
    let newAnimals = cloneDeep(this.state.animals);

    newAnimals.push(generateTraitsEvolvedAnimal(traits, 50));

    this.setState({
      animals: newAnimals
    })
  }

  handleEnvironmentClick = () => {
    let newEnvironment = getNewEnvironment();

    this.setState({
      environment: newEnvironment
    })
  }

  renderAnimals = () => {

    return (
      <div className="animal-gallery">
        {this.state.animals.map(animal =>
          (<Animal {...animal}/>)
        )}
      </div>
    )
  }

    render() {
        return (

            <div className="game-wrapper">
            <button onClick={this.handleNewAnimalClick}>New Animal</button>
            <button onClick={this.handleTestClick}>Test</button>
            <button onClick={this.handleClearClick}>Clear</button>
            {/* <button onClick={this.handleEvolveAccelClick}>Evolve for Acceleration</button>
            <button onClick={this.handleEvolveSpeedClick}>Evolve for Speed</button>
            <button onClick={this.handleEvolveEnduranceClick}>Evolve for Endurance</button> */}
            {this.renderAnimals()}
            <Controls handleEvolveForTraitsClick={this.handleEvolveForTraitsClick} handleEnvironmentClick={this.handleEnvironmentClick}/>
            </div>
        );
  }
}

export default AnimalApp;
