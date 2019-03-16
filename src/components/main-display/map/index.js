import React from "react"
import Map from "./map";
import ZoomMap from "./zoom-map";


export default function mapView(props) {
    let MapView = props.grid.isZoomed ? ZoomMap : Map;

    return (<MapView {...props} />);
}
