import React from "react";
import {getBaseStyle} from "../../../helpers/animal-helpers/style-generator";
import {round} from "lodash";

class Animal extends React.Component {

    render() {

        const baseStyle = getBaseStyle(this.props.size);
        const {bodyStyle, headStyle, frontLegStyle, hindLegStyle, wrapperStyle, earStyle, snoutStyle, neckStyle, headWrapperStyle, tailStyle} = baseStyle;
        const {speed, acceleration, endurance, weight} = this.props.traits;
        const accelerationStats = this.props.traits.accelerationStats;
        const speedStats = this.props.traits.speedStats;
        const enduranceStats = this.props.traits.enduranceStats;


        return (
            <div className="animal-wrapper" style={wrapperStyle}>
                <div className="stats">
                    <span className="acceleration">Accel {acceleration}</span>
                    <span className="speed">Speed {speed}</span>
                    <span className="endurance">Endurance {endurance}</span>
                    <span>Weight {weight}</span>
                </div>
                <div className="animal">
                    <div className="tail" style={tailStyle}></div>

                    <div className="head-wrapper" style={headWrapperStyle}>
                        <div className="neck" style={neckStyle}></div>
                        <div className="head" style={headStyle}>
                            <div className="ear" style={earStyle}></div>
                            <div className="snout" style={snoutStyle}></div>
                        </div>
                    </div>

                    <div className="body" style={bodyStyle}>
                        <span className="acceleration detail-stats">{accelerationStats.idealMassBonus}/{accelerationStats.idealBodyHeightToLengthBonus}</span>
                        <span className="speed detail-stats">{speedStats.idealMassBonus}/{speedStats.idealBodyHeightToLengthBonus}</span>
                        <span className="endurance detail-stats">{enduranceStats.idealMassBonus}/{enduranceStats.idealBodyHeightToLengthBonus}</span>
                    </div>

                    <div className="frontLeg legs" style={frontLegStyle}></div>
                    <div className="hindLeg legs" style={hindLegStyle}>
                        <span className="acceleration detail-stats">{accelerationStats.idealLegLengthBonus}/{accelerationStats.idealLegWidthBonus}</span>
                        <span className="speed detail-stats">{speedStats.idealLegLengthBonus}/{speedStats.idealLegWidthBonus}</span>
                        <span className="endurance detail-stats">{enduranceStats.idealLegLengthBonus}/{enduranceStats.idealLegWidthBonus}</span>
                    </div>
                </div>
                {/* <svg viewBox="0 0 100 100">
                    <polygon points="0,25 0,50 100,75 100,0" />
                </svg> */}
            </div>
        )
    }
}

export default Animal;
