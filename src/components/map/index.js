import React from "react"
import Map from "./map";
import ZoomMap from "./zoom-map";


export default function mapView(props) {
    console.log('map view props', props);

    let MapView = props.grid.isZoomed ? ZoomMap : Map;
    console.log('MapView', MapView);

    return (<MapView {...props} />);
}
