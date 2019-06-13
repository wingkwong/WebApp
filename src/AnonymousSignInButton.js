import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import { connect } from "react-redux";
import { anonymousSignIn } from "./actions";

class AnonymousSignInButton extends  Component {
  constructor(props) {
    super(props);
    this.state = {
      loginLabel: '匿名登入',
      loading: true
    };
  }

  componentDidMount() {
    if(this.props.label  != null ) {
      this.setState({
        loginLabel: this.props.label
      })
    }
  }

  render() {
    const { user, anonymousSignIn } = this.props;

    if (user.loading) {
      return (<div></div>);
    }

    if (user.user) {
      return (null);
    }
    else
    {
      return (
        <Button
          variant="raised"
          onClick={anonymousSignIn}
          color="primary"
        >
          {this.state.loginLabel}
        </Button>
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  console.log(state)
  return {
    geoLocation : state.geoLocation,
    user: state.user
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    anonymousSignIn: () => dispatch(anonymousSignIn())
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(AnonymousSignInButton);
