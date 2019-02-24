import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';
import App from "../../src/App";

storiesOf('Grid', module)
.add('Elevation', () => (
    <App view="map" viewType="elevation"/>
  ))
.add('Rainfall', () => (
    <App view="map" viewType="rainfall"/>
  ))
.add('Temperature', () => (
  <App view="map" viewType="temperature"/>
))
.add('Ground Color', () => (
  <App view="map" viewType="groundColor"/>
))
.add('Grid Color', () => (
  <App view="map" viewType="gridColor"/>
))


storiesOf('Environment', module)
.add('Environment', () => (
    <App view="environment"/>
  ));

