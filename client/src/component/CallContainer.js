import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

function randomID(len) {
  let result = '';
  var chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP',
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

const generateKitToken = (roomID) => {
  const appID = 321572921; // Replace with your actual App ID
  const serverSecret = "cdc77534e0bf6d8b16ba2b8cb9c6ebf2"; // Replace with your actual Server Secret
  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, randomID(5), randomID(5));
  return kitToken;
}

const startCall = (element, roomID, mode) => {
  const kitToken = generateKitToken(roomID);
  
  const zp = ZegoUIKitPrebuilt.create(kitToken);
  zp.joinRoom({
    container: element,
    sharedLinks: [
      {
        name: 'Personal link',
        url: window.location.protocol + '//' + window.location.host + window.location.pathname + '?roomID=' + roomID,
      },
    ],
    scenario: {
      mode: mode,
    },
  });
}

const CallContainer = () => {
  const location = useLocation();
  const { roomID, mode } = location.state || {};

  useEffect(() => {
    if (roomID && mode) {
      const element = document.getElementById('callContainer');
      startCall(element, roomID, mode);
    }
  }, [roomID, mode]);

  return (
    <div className="myCallContainer">
      <div id="callContainer" style={{ width: '100vw', height: '100vh', }}></div>
    </div>
  );
};

export default CallContainer;
