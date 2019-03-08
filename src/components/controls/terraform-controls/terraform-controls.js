import React, {Component} from "react";
import "./terraform-controls.css";

class TerraformControls extends Component {
    constructor(props) {
        super(props);

        this.state = {
            moisture: 0,
            years: 1
        }
    }

    handleMoistureChange = (event) => {
        this.setState({
            moisture: event.target.value
        });
    }

    handleYearsChange = (event) => {
        this.setState({
            years: event.target.value
        });
    }

    handleMoveTime = () => {
        this.props.moveTime(this.state);
    }

    render() {
        console.log('terraform props', this.props);

        return (
            <div className="terraformControlsWrapper">
                <h3> Terraform Controls </h3>

                <div className="rangeValue">Moisture {this.state.moisture}</div>
                <input type="range" min="-5.5" max="5.5" value={this.state.moisture} onChange={this.handleMoistureChange} />

                <div className="rangeValue">Years {this.state.years}</div>
                <input type="range" min="1" max="100" value={this.state.years} onChange={this.handleYearsChange} />

                <button onClick={this.handleMoveTime}>Run</button>
            </div>
        );
    }
}

export default TerraformControls;
