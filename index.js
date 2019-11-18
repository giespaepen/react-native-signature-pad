'use strict';

import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import {
  View,
  WebView,
  StyleSheet,
} from 'react-native';


import htmlContent from './injectedHtml';
import injectedSignaturePad from './injectedJavaScript/signaturePad';
import injectedApplication from './injectedJavaScript/application';
import injectedErrorHandler from './injectedJavaScript/errorHandler';
import injectedExecuteNativeFunction from './injectedJavaScript/executeNativeFunction';

class SignaturePad extends Component {
  static defaultProps = {
    onChange: () => {
    },
    style: {}
  };

  constructor(props) {
    super(props);
    this.state = {base64DataUrl: props.dataURL || null};
    const { backgroundColor } = StyleSheet.flatten(props.style);
    var injectedJavaScript = injectedExecuteNativeFunction
      + injectedErrorHandler
      + injectedSignaturePad
      + injectedApplication(props.penColor, backgroundColor, props.dataURL, props.defaultHeight, props.defaultWidth);
    var html = htmlContent(injectedJavaScript);
    this.source = {html}; //We don't use WebView's injectedJavaScript because on Android, the WebView re-injects the JavaScript upon every url change. Given that we use url changes to communicate signature changes to the React Native app, the JS is re-injected every time a stroke is drawn.
  }

  _bridged_finishedStroke = ({base64DataUrl}) => {
    this.props.onChange({base64DataUrl});
    this.setState({base64DataUrl});
  };

  onMessage = (event) => {
    var base64DataUrl = JSON.parse(event.nativeEvent.data);
    if(base64DataUrl.base64DataUrl) {
        this._bridged_finishedStroke(base64DataUrl);
    }
  };

  clear = () => {
    this.setState({base64DataUrl: null});
    this.props.onChange({base64DataUrl: null});
  };

  render = () => {
    return (
        <WebView automaticallyAdjustContentInsets={false}
                 onMessage={this.onMessage}
                 source={this.source}
                 scrollEnabled={false}
                 javaScriptEnabled={true}
                 style={this.props.style}/>
    )
  };
}

module.exports = SignaturePad;
