import React from "react";
import {animalTemplate} from "../../../helpers/animal-helpers/generate-new-animal";
import {cloneDeep} from "lodash";

class Controls extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedTraits: []
        }
    }

    handleEvolveClick = () => {
        this.props.handleEvolveForTraitsClick(this.state.selectedTraits);
    }

    handleResetClick = () => {
        this.setState({
            selectedTraits: []
        })
    }

    handleEnvironmentClick= () => {
        this.props.handleEnvironmentClick(this.state.selectedTraits);
    }

    handleTraitClick = (trait) => {
        let selectedTraits = cloneDeep(this.state.selectedTraits);
        selectedTraits.push(trait);

        this.setState({
            selectedTraits
        })
    }

    renderSelectedTraits = () => {
        return this.state.selectedTraits.map(trait => (<span className="selected-trait">{trait}</span>));
    }

    renderEvolveButtons = () => {
        let returnButtons = animalTemplate.traits.map((trait) => {
            return (<button type="button" onClick={this.handleTraitClick.bind(this, trait)}>{trait}</button>)
        });

        return returnButtons;
    }

    render() {


        return (
            <div className="controls-wrapper">
                <div className="controls">
                    <div className="evolve-for-trait">
                        <div>
                            <h4>Selected Traits</h4>
                            {this.renderSelectedTraits()}
                        </div>
                        {this.renderEvolveButtons()}
                        <button type="button" className="evolve-button main-button" onClick={this.handleEvolveClick}>Evolve</button>
                        <button type="button" className="reset-button main-button" onClick={this.handleResetClick}>Reset</button>
                        <button type="button" className="environment-button main-button" onClick={this.handleEnvironmentClick}>Generate Environment</button>
                    </div>
                </div>

                <div className="info">

                </div>
            </div>
        )
    }
}

export default Controls;
