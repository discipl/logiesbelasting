import StarRating from 'react-native-star-rating';
import React, { Component } from 'react';
import { Constants } from 'expo';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native'; // 0.16.0

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  
  constructor(props) {
    super(props);
    this.state = {
      starCount: 3
    };
  }

  onStarRatingPress(rating) {
    this.setState({
      starCount: rating
    });
  }

  render() {
    return (
      <View style={styles.container}>
      <StarRating
        disabled={false}
        emptyStar={'ios-star-outline'}
        fullStar={'ios-star'}
        halfStar={'ios-star-half'}
        iconSet={'Ionicons'}
        maxStars={5}
        rating={this.state.starCount}
        selectedStar={(rating) => this.onStarRatingPress(rating)}
        fullStarColor={'gold'}
      />
      <Button title="Submit event claim!" containerViewStyle={{width: '50%', marginLeft: 0}}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1'
  },
});