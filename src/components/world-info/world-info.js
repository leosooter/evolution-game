import React, {Component} from "react";
import "./world-info.css";

class WorldInfo extends Component{
    render() {
        const {
            globalMoisture,
            globalTemp,
            zoomLevel,
            seasons
        } = this.props;

        return (
            <div className="worldInfoWrapper">
                <div className="worldInfoData">
                    <h5>World Info</h5>
                    <div className="worldInfoStat">Global Temp: <em>{globalTemp}</em></div>
                    <div className="worldInfoStat">Global Moisture: <em>{globalMoisture}</em></div>
                    <div className="worldInfoStat">Zoom Level: <em>{zoomLevel}</em></div>
                </div>
            </div>
        )
    }
}

export default WorldInfo;
