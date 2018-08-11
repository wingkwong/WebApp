import * as firebase from 'firebase';
import config from './config/default';
import {addMessage} from './MessageDB';

function postMessage(key, user, userProfile, message,tags, geolocation, streetAddress, startDate, duration, interval, startTime, everydayOpenning, weekdaysOpennings, endDate, link, imageUrl, publicImageURL, thumbnailImageURL, thumbnailPublicImageURL, status, isReportedUrgentEvent, isApprovedUrgentEvent) {  
  // var mapString = "\nhttps://www.google.com.hk/maps/place/"+ geoString(geolocation.latitude, geolocation.longitude) + "/@" + geolocation.latitude + "," + geolocation.longitude + ",18z/";
  return addMessage(key, message, user, userProfile, tags, geolocation, streetAddress,
    // activites 
    startDate, duration, interval, startTime, everydayOpenning, weekdaysOpennings, endDate, link, 
    // images
    imageUrl, publicImageURL, thumbnailImageURL, thumbnailPublicImageURL,
    status, isReportedUrgentEvent, isApprovedUrgentEvent).then((messageKey) => {
    return messageKey;
  });
};

export default postMessage;
