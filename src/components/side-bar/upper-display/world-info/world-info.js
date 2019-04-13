import React, {Component} from "react";
// import "./world-info.css";

class WorldInfo extends Component{
    render() {
        const {
            globalMoisture,
            waterLevel,
            globalTemp,
            zoomLevel,
            currentSeason,
            avgTemp
        } = this.props;

        const seasonStyle = {
            background: currentSeason.backgroundColor
        }

        return (
            <div className="worldInfoWrapper">
                <div className="seasonInfo" style={seasonStyle}>
                    <h5>{currentSeason.name}</h5>
                    <div className="worldInfoStat">Wind Direction: <em>{currentSeason.windDirection}</em></div>
                    <div className="worldInfoStat">Rain Amount: <em>{currentSeason.rainAmount}</em></div>
                    <div className="worldInfoStat">Avg Temperature: <em>{Math.floor(avgTemp / 2)}</em></div>
                    <div className="worldInfoStat">Avg Temperature: <em>{Math.floor(avgTemp / 2)}</em></div>
                </div>

                <div className="worldInfoData">
                    <h5>World Info</h5>
                    <div className="worldInfoStat">Global Temp Modifier: <em>{globalTemp}</em></div>
                    <div className="worldInfoStat">Global Moisture: <em>{globalMoisture}</em></div>
                    <div className="worldInfoStat">Water Level: <em>{waterLevel}</em></div>
                    <div className="worldInfoStat">Zoom Level: <em>{zoomLevel}</em></div>
                </div>
            </div>
        )
    }
}

export default WorldInfo;
