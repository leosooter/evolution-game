import {random} from "lodash";

export const getBaseStyle = (data) => {
    const {
        bodyLength,
        bodyHeight,
        tailLength,
        tailWidth,
        legLength,
        legWidth,
        headLength,
        headHeight,
        neckLength,
        neckHeight,
        snoutLength,
        snoutHeight,
        earLength,
        earWidth,
        neckOffset,
        tailOffset,
        snoutOffset
    } = data;

    const bodyLengthOffset = bodyLength / 10;
    const bodyHeightOffset = bodyHeight / 5;

    const tailAngle = random(-30, 30);
    const neckAngle = random(-30, 30);
    const headAngle = random(0, 30);

    let totalOffset = tailLength;

    const baseStyle = {};

    baseStyle.tailStyle = {
        marginLeft: `${(tailLength / 4)}px`,
        top: `${tailOffset}px`,
        height: `${tailWidth}px`,
        width: `${tailLength + (tailLength / 4)}px`,
        transform: `rotate(${tailAngle}deg)`
    };

    baseStyle.hindLegStyle = {
        marginLeft: `${totalOffset}px`,
        top: `${bodyHeightOffset}px`,
        transformOrigin: `50% ${bodyHeightOffset}px`,
        height: `${legLength + (bodyHeight - bodyHeightOffset)}px`,
        width: `${legWidth}px`,
    };

    baseStyle.bodyStyle = {
        marginLeft: `${totalOffset}px`,
        height: `${bodyHeight}px`,
        width: `${bodyLength}px`,
    };
    totalOffset += bodyLength;

    baseStyle.frontLegStyle = {
        marginLeft: `${totalOffset - legWidth - bodyLengthOffset}px`,
        top: `${bodyHeightOffset}px`,
        transformOrigin: `50% ${bodyHeight / 10}px`,
        height: `${legLength + (bodyHeight - bodyHeightOffset)}px`,
        width: `${legWidth}px`,
    };

    baseStyle.headWrapperStyle = {
        marginLeft: `${totalOffset}px`,
        top: `${bodyHeight / 4}px`,
        // height: `${headHeight}px`,
        // width: `${headLength}px`,
        transform: `rotate(${neckAngle}deg)`
    };

    baseStyle.neckStyle = {
        top: `${neckOffset}px`,
        marginLeft: `-${(headLength / 4)}px`,
        height: `${neckHeight}px`,
        width: `${neckLength + (headLength / 2)}px`,
    };

    baseStyle.headStyle = {
        marginLeft: `${neckLength - (headLength / 4)}px`,
        // top: `${bodyHeight / 4}px`,
        height: `${headHeight}px`,
        width: `${headLength}px`,
        transform: `rotate(${headAngle}deg)`
    };

    baseStyle.earStyle = {
        marginLeft: `${headLength / 10}px`,
        top: `-${earLength}px`,
        height: `${earLength}px`,
        width: `${earWidth}px`,
    };

    baseStyle.snoutStyle = {
        marginLeft: `${headLength}px`,
        bottom: `${snoutOffset}px`,
        height: `${snoutHeight}px`,
        width: `${snoutLength}px`,
    };

    baseStyle.wrapperStyle = {
        height: `${bodyHeight + legLength}px`,
        width: `${bodyLength + headLength}px`,
    };

    return baseStyle;
}
