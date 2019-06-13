import React, { Component } from 'react';
import {connect} from "react-redux";
import { Form } from 'reactstrap';
import uuid from 'js-uuid';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import LocationButton from './LocationButton';
import postMessage from './PostMessage';
import SelectedMenu from './SelectedMenu';
import {constant, RoleEnum} from './config/default';
import UploadImageButton from './UploadImageButton';
import IntegrationReactSelect from './IntegrationReactSelect';
import SignInButton from './SignInButton';
import AnonymousSignInButton from './AnonymousSignInButton';
import { parseTime, parseDate, parseLocation } from './util/messageParser';
import ParseDateButton from './ParseDateButton';
import ParseTimeButton from './ParseTimeButton';
import ParseLocationButton from './ParseLocationButton';
import {
  openSnackbar,
  checkAuthState,
  updateRecentMessage,
} from './actions';

const styles = theme => ({
  root: {
    flexGrow: 1,
    top: 'auto',
    bottom: 40,
    position: 'fixed',
  },
  hidden: {
    display: 'none',
  },
  flex: {
    flex: 1,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  formControl: {
    margin: theme.spacing.unit,
  },
  dialogContainer: {
    padding: '0.5rem'
  },
  dialogTitle: {
    background: 'linear-gradient(to bottom, #006fbf  50%, #014880 50%)',
  },
  signButton: {
    fontWeight: 'bold',
    display: 'inline-block',
    margin: theme.spacing.unit,
    textAlign: 'center',
    color: 'white',
    backgroundColor: '#006eb9',
 //   padding: '5px',
    border: '2px solid white',
    borderRadius: '2px',
    boxShadow: '0 0 0 3px #006eb9, 0 0 10px #aaa',
    '&:hover': {
      backgroundColor: '#006eb9',
    }, 
  },
  parseButton: {
    width: '300px',
    height: '80px',
    margin: '10px auto'
  }
});

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class PostMessageView extends Component {
  constructor(props) {
    super(props);
    let key = uuid.v4();
    this.state = {popoverOpen: false, buttonShow: false,
      // message
      key: key,
      summary: "",
      link: "",
      start: this.today(),
      startTime: this.startTime(),
      end: this.today(),
      status: "開放",
      timeExpanded: false,
      descExpanded: false,
      pollingExpanded: false,
      desc: "",
      isReportedUrgentEvent: false,
      isApprovedUrgentEvent: false,
      imageURL: null,
      publicImageURL: null,
      thumbnailImageURL: null,
      thumbnailPublicImageURL: null,
      opennings: this.props.opennings,
      timeSelection: constant.timeOptions[0],
      intervalSelection: this.props.intervalOptions[0],
      durationSelection: this.props.durationOptions[0],
      openningSelection: this.props.openningOptions[0],
      tags: [],
      pollingOptions: [],
      pollingOptionValues: [],
      pollingOptionIndex: 0,
      maxOfPollingOptionIndex: 6,
      pollingTitle: "",
      minPollingOptions: 2,
      numOfMaxPollng: 1,
      pollingRange: 1,
      geolocation: null,
      streetAddress: null,
      isParseDateButtonVisible: false,
      isParseTimeButtonVisible: false,
      isParseLocationButtonVisible: false,
      parsedStartDate: null,
      parsedStartTime: null,
      parsedStreetAddress: null,
      parsedGeolocation: null
    };
    this.handleRequestDelete = this.handleRequestDelete.bind(this);
    this.handleTouchTap = this.handleTouchTap.bind(this);
    this.handleTagChange = this.handleTagChange.bind(this);
    this.renderWeekdayHtml = this.renderWeekdayHtml.bind(this);
    this.renderOpenningHtml = this.renderOpenningHtml.bind(this);
    this.renderActivitiesHtml = this.renderActivitiesHtml.bind(this);
    this.setOpenning = this.setOpenning.bind(this);
    this.addPollingOptions = this.addPollingOptions.bind(this);
    this.handleParseDateButtonClick = this.handleParseDateButtonClick.bind(this);
    this.handleParseTimeButtonClick = this.handleParseTimeButtonClick.bind(this);
    this.handleParseLocationButtonClick = this.handleParseLocationButtonClick.bind(this);
    this.summaryTextField = null;

  }

  static defaultProps = {
    weekdayLabel : constant.weekdayLabel,
    openningOptions : constant.openningOptions,
    intervalOptions : constant.intervalOptions,
    durationOptions : constant.durationOptions,
    openning :  {enable: true, open: '09:00', close: '17:00'},
    opennings : [
      {enable: true, open: '09:00', close: '17:00'}, // all days
      {enable: true, open: '09:00', close: '17:00'}, // sun
      {enable: true, open: '09:00', close: '17:00'}, // mon
      {enable: true, open: '09:00', close: '17:00'}, // tue
      {enable: true, open: '09:00', close: '17:00'}, // wed
      {enable: true, open: '09:00', close: '17:00'}, // thur
      {enable: true, open: '09:00', close: '17:00'}, // fri
      {enable: true, open: '09:00', close: '17:00'}, // sat
      ]
    }

  componentDidMount() {
    if (this.props.user  != null  && this.props.user.user  != null ) {
//      console.log("DidMount Enable Post");
      this.setState({buttonShow: true});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.user !== this.props.user && this.props.user  != null ) {
//      console.log("DidUpdate Enable Post");
      const {user} = this.props.user;
      if (user) {
        this.setState({buttonShow: true});
      } else {
        this.setState({buttonShow: false});
      }
    }
  }


  handleRequestOpen(evt) {
    evt.preventDefault();
    var key = uuid.v4();
    this.setState({
     // message
      key: key,
      summary: "",
      link: "",
      desc: "",
      start: this.today(),
      startTime: this.startTime(),
      end: this.today(),
      timeExpanded: false,
      descExpanded: false,
      rotate: 'rotate(0deg)',
      isReportedUrgentEvent: false,
      tags: [],
      popoverOpen: true,
      timeSelection: constant.timeOptions[0],
      anchorEl: evt.currentTarget,
      imageURL: null,
      publicImageURL: null,
      thumbnailImageURL: null,
      thumbnailPublicImageURL: null,
      opennings: this.props.opennings,
      intervalSelection: this.props.intervalOptions[0],
      durationSelection: this.props.durationOptions[0],
      openningSelection: this.props.openningOptions[0],
      pollingOptions: [],
      pollingOptionValues: [],
      pollingOptionIndex: 0,
      maxOfPollingOptionIndex: 6,
      pollingTitle: "",
      minPollingOptions: 2,
      numOfMaxPollng: 1,
      pollingRange: 1,
      geolocation: null,
      streetAddress: null,
      isParseDateButtonVisible: false,
      isParseTimeButtonVisible: false,
      isParseLocationButtonVisible: false,
      parsedStartDate: null,
      parsedStartTime: null,
      parsedStreetAddress: null,
      parsedGeolocation: null
    });
  }

  handleRequestClose() {
  //  this.uploadImageButton.onDelete();
    this.setState({
      popoverOpen: false,
    });
  };

  handleMessageDescOnChange(evt) {
    let messageDesc = evt.target.value;
    this.setState({ desc: messageDesc });

    parseDate(messageDesc).then((date) => {
      if(date != null) {
        this.setState({ 
          parsedStartDate: date,
          isParseDateButtonVisible: true 
        });
      } else {
        this.setState({ 
          parsedStartDate: null,
          isParseDateButtonVisible: false 
        });
      }
    });

    parseTime(messageDesc).then((time) => {
      if(time != null) {
        this.setState({ 
          parsedStartTime: time,
          isParseTimeButtonVisible: true,
        });
      } else {
        this.setState({ 
          parsedStartTime: null,
          isParseTimeButtonVisible: false 
        });
      }
    });

    parseLocation(messageDesc).then((response) => {
      if(response != null) {
        this.setState({
          parsedStreetAddress: response.json.results[0].formatted_address,
          parsedGeolocation: {
            latitude: response.json.results[0].geometry.location.lat,
            longitude: response.json.results[0].geometry.location.lng
          },
          isParseLocationButtonVisible: true
        });
      } else {
        this.setState({ 
          parsedStreetAddress: null,
          parsedGeolocation: null,
          isParseLocationButtonVisible: false 
        });
      }
    });
  }

  handleParseDateButtonClick() {
    const { parsedStartDate } = this.state;
    this.setState({
      start: parsedStartDate,
      parsedStartDate: null,
      isParseDateButtonVisible: false,
      timeExpanded: true
    });
  }

  handleParseTimeButtonClick() {
    const { parsedStartTime } = this.state;
    this.setState({
      startTime: parsedStartTime,
      parsedStartTime: null,
      isParseTimeButtonVisible: false,
      timeExpanded: true
    });
  }

  handleParseLocationButtonClick() {
    const { parsedStreetAddress, parsedGeolocation } = this.state;
    this.setState({
      streetAddress: parsedStreetAddress,
      geolocation: parsedGeolocation,
      isParseLocationButtonVisible: false
    });
  }

  onSubmit() {
    console.log(" expand:  " + this.state.timeExpanded + " " + this.state.intervalSelection + " " + this.state.durationSelection + " " + this.state.start)
    let interval = null;
    let duration = null;
    let startDate = null;
    let startTime = null;
    let everydayOpenning = null;
    let weekdaysOpennings = null;
    let endDate = null;
    let isUrgentEvent = null;
    let desc = null;
    if(this.state.descExpanded) {
      desc = this.state.desc;
    }
    if(this.state.timeExpanded) { // detail for time
      startDate = this.state.start;
      // console.log('Now Time ' + startTimeInMs+ ' ' + this.state.start);
      switch(this.state.timeSelection) {
        case constant.timeOptions[0]:
          interval = this.state.intervalSelection;
          duration = this.state.durationSelection;
          startTime = this.state.startTime;
          if(this.state.intervalSelection !== this.props.intervalOptions[0]) {
            endDate = this.state.end;
          }
          break;
        default:
          switch(this.state.openningSelection) {
            case this.props.openningOptions[0]:
              everydayOpenning = this.state.opennings[0];
              break;
            case this.props.openningOptions[1]:
              weekdaysOpennings = [this.state.opennings[1], this.state.opennings[2], this.state.opennings[3], this.state.opennings[4], this.state.opennings[5], this.state.opennings[6], this.state.opennings[7]]
              break;
            default:
              break;
          }
      }
    }
    if (this.state.summary === null || this.state.summary === undefined || this.state.summary.length === 0) {
      this.summaryTextField.select();
      this.props.openSnackbar(constant.pleaseInputSummary, 'warning');
    } else if (this.state.geolocation === null || this.state.geolocation === undefined) {
      //this.locationButton.handleClickOpen();
      this.props.openSnackbar(constant.pleaseInputLocation, 'warning');
      //this.setState({locationTipOpen: true});
    } else {
      var imageURL = null;
      var publicImageURL = null;
      var thumbnailImageURL = null;
      var thumbnailPublicImageURL = null;

      if(this.state.imageURL  != null ) {
        imageURL = this.state.imageURL;
      }
      if(this.state.publicImageURL  != null ) {
        publicImageURL = this.state.publicImageURL;
      }
      if(this.state.thumbnailImageURL  != null ) {
        thumbnailImageURL = this.state.thumbnailImageURL;
      }
      if(this.state.thumbnailPublicImageURL  != null ) {
        thumbnailPublicImageURL = this.state.thumbnailPublicImageURL;
      }

      var tags = this.state.tags.map((tag) => tag.text);

      var polling = {
        pollingTitle: this.state.pollingTitle,
        numOfMaxPollng: this.state.numOfMaxPollng,
        pollingRange: this.state.pollingRange,
        pollingOptionValues: this.state.pollingOptionValues,
        results: []
      }

      postMessage(this.state.key, this.props.user.user, this.props.user.userProfile, this.state.summary, tags, this.state.geolocation, this.state.streetAddress, desc,
         startDate, duration, interval, startTime, everydayOpenning, weekdaysOpennings, endDate, this.state.link,
         imageURL, publicImageURL, thumbnailImageURL, thumbnailPublicImageURL,
         this.state.status, this.state.isReportedUrgentEvent, this.state.isApprovedUrgentEvent, isUrgentEvent, polling).then((messageKey) => {
           const { updateRecentMessage, checkAuthState} = this.props;
           if(messageKey  != null  && messageKey !== "") {
             updateRecentMessage(messageKey, false);
             checkAuthState();
             this.props.openSnackbar(constant.createMessageSuccess, 'success');
             this.setState({
               popoverOpen: false
             });
           } else {
             this.props.openSnackbar(constant.createMessageFailure, 'error');
           }
         });
    }
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };
  handleTimeExpandClick() {
    this.setState({ timeExpanded: !this.state.timeExpanded });
  };
  handleDescExpandClick() {
    this.setState({ descExpanded: !this.state.descExpanded });
  };

  handlePollingClick() {
    this.setState({ pollingExpanded: !this.state.pollingExpanded });
  };

  handleRequestDelete(evt) {
    alert(evt);
  }

  handleTouchTap(evt) {
    alert(evt);
  }

  setOpenning(index, type,  value) {
    let opennings = this.state.opennings;
    opennings[index][type] = value;
    this.setState({opennings: opennings});
  }

  timeOptionSelection(selectedValue) {
    this.setState({timeSelection: selectedValue});
  }

  intervalOptionSelection(selectedValue) {
    this.setState({intervalSelection: selectedValue});
  }

  durationOptionSelection(selectedValue) {
    this.setState({durationSelection: selectedValue});
  }
  openningOptionSelection(selectedValue) {
    this.setState({openningSelection: selectedValue});
  }

  handleTagChange(value) {
    let tags = [];
    if(value  != null  && value !== '') {
      var partsOfStr = value.split(',');
      partsOfStr.forEach(function(element) {
        tags.push({
          id: tags.length + 1,
          text: element
        });
      });
    }
    this.setState({tags: tags});
  }

  locationButtonSubmit = (geolocation, streetAddress) => {
    console.log("locationButtonSubmit ");
    this.setState({
        geolocation: geolocation,
        streetAddress: streetAddress,
        locationTipOpen: false,
    });
  };


  uploadFinish(imageURL, publicImageURL, thumbnailImageURL, thumbnailPublicImageURL) {
    this.setState({
      imageURL: imageURL,
      publicImageURL: publicImageURL,
      thumbnailImageURL: thumbnailImageURL,
      thumbnailPublicImageURL: thumbnailPublicImageURL
    });
//    console.log("uploadFinish: " + this.state.imageURL + " " + this.state.publicImageURL+ " " + this.state.thumbnailImageURL+ " " + this.state.thumbnailPublicImageURL)
  }

  today() {
    let now = new Date();
    return `${now.getFullYear()}-${("0" + (now.getMonth()+1)).slice(-2)}-${("0" + now.getDate()).slice(-2)}`;
  }

  startTime() {
    let now = new Date();
    return `${("0" + now.getHours()).slice(-2)}:${("0" + now.getMinutes()).slice(-2)}`;
  }

  renderWeekdayHtml(label, index) {
    const classes = this.props.classes;
    let openningHours = constant.closeWholeDay;
    if(this.state.opennings[index].enable) {
      openningHours = <React.Fragment>
                  <TextField
                    id={`open${index}`}
                    type="time"
                    defaultValue={this.state.opennings[index].open}
                    className={classes.textField}
                    onChange={event => this.setOpenning(index, 'open', event.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 min
                    }}
                  /> 至 <TextField
                  id={`close${index}`}
                  type="time"
                  defaultValue={this.state.opennings[index].close}
                  className={classes.textField}
                  onChange={event => this.setOpenning(index, 'close', event.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                />
        </React.Fragment>;
    }
    return(
      <Toolbar>
        <FormControlLabel
          label={label}
          control={
            <Checkbox
              id={label}
              checked={this.state.opennings[index].enable}
              onChange={() => this.setOpenning(index, 'enable', !this.state.opennings[index].enable)}
            />
            }
          />
        {openningHours}
      </Toolbar>
    );
  }

  renderOpenningHtml() {

    let openningHtml = null;
    const classes = this.props.classes;
    switch(this.state.openningSelection) {
      case this.props.openningOptions[0]:
        openningHtml = <Toolbar>
                  <TextField
                    id="open"
                    type="time"
                    defaultValue={this.state.opennings[0].open}
                    className={classes.textField}
                    onChange={event => this.setOpenning(0, 'open', event.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 min
                    }}
                  /> 至 <TextField
                  id="close"
                  type="time"
                  defaultValue={this.state.opennings[0].close}
                  className={classes.textField}
                  onChange={event => this.setOpenning(0, 'close', event.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                />
        </Toolbar>
        break;
      default:
        let i = 0;
        openningHtml = this.props.weekdayLabel.map((label) => {
          i++;
          return this.renderWeekdayHtml(label, i);
        });
        break;
    }
    return (<React.Fragment>
      <Toolbar>
        <TextField
          id="start"
          label="開始日期"
          type="date"
          value={this.state.start}
          className={classes.textField}
          margin="normal"
          onChange={event => this.setState({ start: event.target.value })}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <SelectedMenu label="" options={this.props.openningOptions} changeSelection={(selectedValue) => this.openningOptionSelection(selectedValue)} />
      </Toolbar>
      {openningHtml}
    </React.Fragment>);
  }

  renderActivitiesHtml() {

    let today = this.today();
    let endDateHtml = null;
    const classes = this.props.classes;
    if(this.state.intervalSelection !== this.props.intervalOptions[0]) {
    endDateHtml = <TextField
            id="end"
            label="完結日期"
            type="date"
            defaultValue={today}
            className={classes.textField}
            margin="normal"
            onChange={event => this.setState({ end: event.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
    }

    return (<React.Fragment>
      <Toolbar>
        <TextField
          id="start"
          label="開始日期"
          type="date"
          value={this.state.start}
          className={classes.textField}
          margin="normal"
          onChange={event => this.setState({ start: event.target.value })}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          id="startTime"
          label="開始時間"
          type="time"
          value={this.state.startTime}
          className={classes.textField}
          onChange={event => this.setState({ startTime: event.target.value })}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            step: 300, // 5 min
          }}
        />
      </Toolbar>
      <Toolbar>
        <SelectedMenu label="為期" options={this.props.durationOptions} changeSelection={(selectedValue) => this.durationOptionSelection(selectedValue)} ref={(durationSelection) => {this.durationSelection = durationSelection;}}/>
      </Toolbar>
      <Toolbar>
        <SelectedMenu label="" options={this.props.intervalOptions} changeSelection={(selectedValue) => this.intervalOptionSelection(selectedValue)}ref={(intervalSelection) => {this.intervalSelection = intervalSelection;}}/>
        {endDateHtml}
      </Toolbar>
    </React.Fragment>);
  }

  addPollingOptions(evt) {
    if(evt) evt.preventDefault();
    var array = this.state.pollingOptions;
    let pollingOptionIndex = this.state.pollingOptionIndex;

    if(pollingOptionIndex >= this.state.maxOfPollingOptionIndex) {
      return this.props.openSnackbar(constant.excessNumOfPollingIndex, 'warning');
    }

    array.push(pollingOptionIndex)

    pollingOptionIndex += 1;

     this.setState({
       pollingOptions: array,
       pollingOptionIndex: pollingOptionIndex
     });
 }

 updatePollingValueOnChange(evt, pollingOptionIndex){
   const pollingOptionValues = this.state.pollingOptionValues;
   pollingOptionValues[pollingOptionIndex] = evt.target.value;
   this.setState({pollingOptionValues});
 }

  render() {
    const { user, classes } = this.props;
    let userProfile = user.userProfile;
    let timeHtml = null;
    let urgentHtml = null;
    let pollingHtml =  null;
    if (user.userProfile && (user.userProfile.role === RoleEnum.admin || user.userProfile.role === RoleEnum.monitor || user.userProfile.role === RoleEnum.betaUser)) {
        pollingHtml = <FormGroup>
                        <FormControlLabel
                        label={constant.addPollingLabel}
                        control={
                          <Checkbox
                            checked={this.state.pollingExpanded}
                            onChange={() => this.handlePollingClick()}
                            value="checkedA" />
                          }
                        />
                    </FormGroup>;
    }
    if(userProfile  != null  && (userProfile.role === RoleEnum.admin ||  userProfile.role === RoleEnum.betaUser || userProfile.role === RoleEnum.monitor)) {
      urgentHtml = <FormGroup>
                    <FormControlLabel
                    label="緊急事項"
                    control={
                      <Checkbox
                        checked={this.state.isReportedUrgentEvent}
                        onChange={this.handleChange('isReportedUrgentEvent')}
                        value="isReportedUrgentEvent" />
                      }
                    />
                </FormGroup>
    }
    let postButtonHtml =  <Button size="small" className={classes.signButton} color="primary" onClick={(evt) => this.handleRequestOpen(evt)}>
                            +{constant.postLabel}
                          </Button>;

    if(this.state.buttonShow) {
      if(this.state.timeExpanded) {
        switch(this.state.timeSelection) {
          case constant.timeOptions[0]:
            timeHtml = this.renderActivitiesHtml();
            break;
          default:
            timeHtml = this.renderOpenningHtml();
            break;
        }
      }

      if(this.state.pollingOptions.length < this.state.minPollingOptions) {
        this.addPollingOptions(null);
      }

      return (
        <React.Fragment>
          {postButtonHtml}
          <Dialog
            fullScreen
            open={this.state.popoverOpen}
            onRequestClose={() => this.handleRequestClose()}
            transition={Transition}
            unmountOnExit>
            <AppBar className={classes.dialogTitle}>
              <DialogActions>
                <IconButton color="contrast" onClick={() => this.handleRequestClose()} aria-label="Close">
                  <CloseIcon />
                </IconButton>
                <Typography variant="title" color="inherit" className={classes.flex}> </Typography>
                <Button variant="raised" color="primary" onClick={() => this.onSubmit()}>{constant.postLabel}</Button>
              </DialogActions>
            </AppBar>
              <div className={classes.dialogContainer}>
              <br/>
              <br/>
              <br/>
              <Form>
                <FormGroup>
                  <TextField
                    autoFocus
                    required
                    id="message"
                    placeholder="事件簡介及期望街坊如何參與"
                    fullWidth
                    margin="normal"
                    value={this.state.summary}
                    onChange={event => this.setState({ summary: event.target.value })}
                    inputRef={(tf) => {this.summaryTextField = tf;}}
                  />
                  <IntegrationReactSelect
                    showLabel={false}
                    placeholder={constant.tagPlaceholder}
                    suggestions={this.props.suggestions.tag}
                    onChange={(value) => this.handleTagChange(value)}
                  />
                  <div className={classes.hidden}>
                    <TextField id="status" label="現況" className={classes.textField} disabled value={this.state.status} />
                  </div>
                  <br/>
                    <LocationButton ref={(locationButton) => {this.locationButton = locationButton;}} geolocation={this.state.geolocation} streetAddress={this.state.streetAddress} onSubmit={this.locationButtonSubmit}/>
                </FormGroup>
                <FormGroup>
                <UploadImageButton ref={(uploadImageButton) => {this.uploadImageButton = uploadImageButton;}} path={this.state.key} uploadFinish={(imageURL, publicImageURL, thumbnailImageURL, thumbnailPublicImageURL) => {this.uploadFinish(imageURL, publicImageURL, thumbnailImageURL, thumbnailPublicImageURL);}}/>
                </FormGroup>
                <FormGroup>
                    <TextField id="link" label="外部連結" className={classes.textField} value={this.state.link} onChange={event => this.setState({ link: event.target.value })}/>
                </FormGroup>
                <FormGroup>
                  <FormControlLabel
                  label="事件詳情"
                  control={
                    <Checkbox
                      checked={this.state.descExpanded}
                      onChange={() => this.handleDescExpandClick()}
                      value="checkedA" />
                    }
                  />
                </FormGroup>
                <Collapse in={this.state.descExpanded} transitionDuration="auto" unmountOnExit>
                  <FormGroup>
                    <TextField autoFocus required 
                                id="desc"  
                                fullWidth  
                                multiline 
                                rowsMax="20" 
                                margin="normal"
                                helperText="事件詳情及期望街坊如何參與 時間等資料請用詳細時間" 
                                value={this.state.desc} 
                                onChange={event => this.handleMessageDescOnChange(event)}/>
                  <ParseDateButton className={classes.parseButton} isVisible={this.state.isParseDateButtonVisible} parsedStartDate={this.state.parsedStartDate} handleParseDateButtonClick={this.handleParseDateButtonClick}/>
                  <ParseTimeButton className={classes.parseButton} isVisible={this.state.isParseTimeButtonVisible} parsedStartTime={this.state.parsedStartTime} handleParseTimeButtonClick={this.handleParseTimeButtonClick}/>
                  <ParseLocationButton className={classes.parseButton} isVisible={this.state.isParseLocationButtonVisible} parsedStreetAddress={this.state.parsedStreetAddress} handleParseLocationButtonClick={this.handleParseLocationButtonClick}/>
                  </FormGroup>
                  <br/>
                </Collapse>
                <FormGroup>
                  <FormControlLabel
                  label="詳細時間"
                  control={
                    <Checkbox
                      checked={this.state.timeExpanded}
                      onChange={() => this.handleTimeExpandClick()}
                      value="checkedA" />
                    }
                  />
                </FormGroup>
                <Collapse in={this.state.timeExpanded} transitionDuration="auto" unmountOnExit>
                  <FormGroup>
                    <SelectedMenu label="" options={constant.timeOptions} changeSelection={(selectedValue) => this.timeOptionSelection(selectedValue)} ref={(timeSelection) => {this.timeSelection = timeSelection}}/>
                    {timeHtml}
                  </FormGroup>
                  <br/>
                </Collapse>
                {pollingHtml}
                <Collapse in={this.state.pollingExpanded} transitionDuration="auto" unmountOnExit>
                  <FormGroup>
                  <TextField id="pollingTitle" label={constant.pollingTitleLabel} className={classes.textField} value={this.state.pollingTitle} onChange={event => this.setState({pollingTitle: event.target.value})}/>
                  <br/>
                  <TextField id="numOfMaxPollng" type="number" InputProps={{ inputProps: { min: 1, max: this.state.pollingOptions.length } }} helperText={constant.numOfMaxPollngLabel} className={classes.textField} value={this.state.numOfMaxPollng} onChange={event => this.setState({numOfMaxPollng: event.target.value})}/>
                  <br/>
                  <TextField id="pollingRange" type="number" InputProps={{ inputProps: { min: 1, max: 5 } }} helperText={constant.pollingRangeLabel} className={classes.textField} value={this.state.pollingRange} onChange={event => this.setState({pollingRange: event.target.value})}/>
                  {
                    this.state.pollingOptions.map((value) => {
                      return <TextField key={value} id="link" label={constant.pollingOptionLabel} className={classes.textField} value={this.state.pollingOptionValues[value]} onChange={(evt) => {this.updatePollingValueOnChange(evt, value)} }/>
                    })
                  }
                  <br/>
                  <Button variant="raised" color="primary" onClick={(evt) => this.addPollingOptions(evt)}>{constant.addPollingOption}</Button>
                  </FormGroup>
                  <br/>
                </Collapse>
                {urgentHtml}
              </Form>
              </div>
        </Dialog>
        </React.Fragment>
      )
    } else {
      return (
        <div className="cta-report-wrapper">
          <AnonymousSignInButton/>
          <SignInButton label={`請先登入方可${constant.postLabel}`}/>
        </div>
      );
    }
  }
};


const mapStateToProps = (state, ownProps) => {
  return {
    geoLocation : state.geoLocation,
    user:         state.user,
    suggestions:  state.suggestions,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    openSnackbar:
      (message, variant) =>
        dispatch(openSnackbar(message, variant)),
    updateRecentMessage:
      (recentMessageID, open) =>
        dispatch(updateRecentMessage(recentMessageID, open)),
    checkAuthState:
      () => dispatch(checkAuthState()),
  }
};

export default withStyles(styles) (connect(mapStateToProps, mapDispatchToProps)(PostMessageView));
