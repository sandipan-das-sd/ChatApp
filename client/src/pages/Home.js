

// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { logout, setOnlineUser, setUser, setSocketConnection } from '../redux/userSlice';
// import axios from 'axios';
// import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// import Sidebar from '../component/Sidebar';
// import logo from "../assets/logo.png";
// import io from 'socket.io-client';

// const fetchUserDetails = async (dispatch, navigate) => {
//   try {
//     const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
//     const response = await axios({
//       url: URL,
//       withCredentials: true,
//     });
//     dispatch(setUser(response.data.data));
//     if (response.data.data.logout) {
//       dispatch(logout());
//       navigate('/email');
//     }
//     // console.log("Current user details", response);

//     // Update the user state with the fetched details
//     dispatch(setUser(response.data.data));
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// function Home() {
//   const user = useSelector((state) => state.user);
//   console.log("user", user);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const basePath = location.pathname === '/'; // to hide the message section when user on the home url after login
//   const [connectionError, setConnectionError] = useState(null);
//   useEffect(() => {
//     fetchUserDetails(dispatch, navigate);
//   }, [dispatch, navigate]);

//   useEffect(() => {
//     const token = localStorage.getItem('Token'); // Assuming you store your token in localStorage

//     const socketConnection = io(process.env.REACT_APP_BACKEND_URL, {
//       auth: {
//         token,
//       },
//     });

//     socketConnection.on('Online User', (data) => {
//       console.log("Online User", data);
//       dispatch(setOnlineUser(data));
//       // Do something with the online user data received from the server
//     });
//     dispatch(setSocketConnection(socketConnection));

//     return () => {
//       socketConnection.disconnect();
//     };
//   }, [dispatch]);

//   return (
//     <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
//       <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
//         <Sidebar />
//       </section>

//       {/**message component**/}
//       <section className={`${basePath && "hidden"}`}>
//         <Outlet />
//       </section>

//       <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex"}`}>
//         <div>
//           <img src={logo} width={250} alt='logo' />
//         </div>
//         <p className='text-lg mt-2 text-slate-500'>Select user to send message</p>
//       </div>
//     </div>
//   );
// }

// export default Home;

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setOnlineUser, setUser, setSocketConnection } from '../redux/userSlice';
import axios from 'axios';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import logo from "../assets/logo.png";
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

// Constants
const MAX_RECONNECT_ATTEMPTS = 5;
const SOCKET_TIMEOUT = 10000;
const FETCH_TIMEOUT = 5000;

// Utility function to log errors with timestamp
const logError = (context, error) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${context}:`, error);
  console.error('Error stack:', error.stack);
};

const fetchUserDetails = async (dispatch, navigate) => {
  console.log('[fetchUserDetails] Starting user details fetch...');
  
  try {
    const token = localStorage.getItem('Token');
    if (!token) {
      console.warn('[fetchUserDetails] No token found in localStorage');
      throw new Error('No authentication token found');
    }

    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
    console.log('[fetchUserDetails] Fetching from URL:', URL);

    const response = await axios({
      url: URL,
      method: 'GET',
      withCredentials: true,
      timeout: FETCH_TIMEOUT,
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    console.log('[fetchUserDetails] Response received:', response.data);

    if (response.data.data) {
      dispatch(setUser(response.data.data));
      console.log('[fetchUserDetails] User data dispatched to Redux');

      if (response.data.data.logout) {
        console.log('[fetchUserDetails] Logout flag detected, initiating logout');
        dispatch(logout());
        navigate('/email');
      }
    }
  } catch (error) {
    logError('[fetchUserDetails]', error);

    if (error.response) {
      // Server responded with error
      console.error('Server response error:', {
        status: error.response.status,
        data: error.response.data
      });
      toast.error(error.response.data.message || 'Failed to fetch user details');
    } else if (error.request) {
      // Request made but no response
      console.error('No response received from server');
      toast.error('Server not responding. Please check your connection.');
    } else {
      // Other errors
      console.error('Error during request setup:', error.message);
      toast.error('Unable to connect to server');
    }

    // Clear token and redirect on authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('[fetchUserDetails] Authentication error detected, clearing token');
      localStorage.removeItem('Token');
      navigate('/email');
    }
  }
};

function Home() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname === '/';
  
  // State management
  const [connectionError, setConnectionError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [socketInstance, setSocketInstance] = useState(null);
  const [lastPingTime, setLastPingTime] = useState(null);

  // Socket cleanup function
  const cleanupSocket = useCallback(() => {
    if (socketInstance) {
      console.log('[cleanup] Disconnecting socket:', socketInstance.id);
      socketInstance.disconnect();
      setSocketInstance(null);
      setConnectionStatus('disconnected');
    }
  }, [socketInstance]);

  // Socket initialization function
  const initializeSocket = useCallback(() => {
    console.log('[initializeSocket] Starting socket initialization...');
    
    const token = localStorage.getItem('Token');
    if (!token) {
      console.error('[initializeSocket] No token found in localStorage');
      setConnectionError('Authentication required');
      navigate('/email');
      return;
    }

    try {
      const SOCKET_URL = process.env.REACT_APP_BACKEND_URL;
      console.log('[initializeSocket] Attempting connection to:', SOCKET_URL);

      // Clean up existing socket if any
      cleanupSocket();

      const socket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        timeout: SOCKET_TIMEOUT,
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      // Connection event handlers
      socket.on('connect', () => {
        console.log('[Socket] Connected successfully. Socket ID:', socket.id);
        setConnectionStatus('connected');
        setConnectionError(null);
        setReconnectAttempts(0);
        toast.success('Connected to chat server');
        
        // Start ping interval
        const pingInterval = setInterval(() => {
          socket.emit('ping');
          setLastPingTime(Date.now());
        }, 30000);

        socket.pingInterval = pingInterval;
      });

      socket.on('pong', () => {
        const latency = Date.now() - lastPingTime;
        console.log('[Socket] Ping latency:', latency, 'ms');
      });

      socket.on('connect_error', (error) => {
        logError('[Socket] Connection error', error);
        setConnectionStatus('error');
        setConnectionError(`Connection error: ${error.message}`);
        setReconnectAttempts((prev) => prev + 1);
        
        if (error.message.includes('authentication')) {
          console.log('[Socket] Authentication error detected');
          localStorage.removeItem('Token');
          navigate('/email');
          return;
        }

        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.log('[Socket] Max reconnection attempts reached');
          toast.error('Failed to connect after multiple attempts');
          cleanupSocket();
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected. Reason:', reason);
        setConnectionStatus('disconnected');
        
        if (reason === 'io server disconnect') {
          console.log('[Socket] Server initiated disconnect');
          toast.error('Disconnected by server. Please check your authentication.');
          navigate('/email');
        } else {
          console.log('[Socket] Attempting to reconnect...');
          toast.warning('Connection lost. Attempting to reconnect...');
        }

        // Clear ping interval
        if (socket.pingInterval) {
          clearInterval(socket.pingInterval);
        }
      });

      socket.on('error', (error) => {
        logError('[Socket] General error', error);
        toast.error('Connection error occurred');
      });

      socket.on('Online User', (data) => {
        console.log('[Socket] Online users updated:', data);
        dispatch(setOnlineUser(data));
      });

      // Store socket instance
      setSocketInstance(socket);
      dispatch(setSocketConnection(socket));

      return socket;
    } catch (error) {
      logError('[initializeSocket] Initialization error', error);
      setConnectionError(`Failed to initialize: ${error.message}`);
      toast.error('Failed to initialize chat connection');
      return null;
    }
  }, [dispatch, navigate, reconnectAttempts, cleanupSocket, lastPingTime]);

  // Initialize socket connection
  useEffect(() => {
    console.log('[Home] Component mounted');
    fetchUserDetails(dispatch, navigate);
    const socket = initializeSocket();

    return () => {
      console.log('[Home] Component unmounting');
      cleanupSocket();
    };
  }, [dispatch, navigate, initializeSocket, cleanupSocket]);

  // Monitor connection status
  useEffect(() => {
    if (connectionStatus === 'error' && reconnectAttempts > 0) {
      console.log(`[Monitor] Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
    }
  }, [connectionStatus, reconnectAttempts]);

  // Debug logging for user state changes
  useEffect(() => {
    console.log('[State] Current user state:', user);
  }, [user]);

  // Connection status indicator component
  const ConnectionStatus = () => (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-full shadow-md flex items-center gap-2 ${
      connectionStatus === 'connected' ? 'bg-green-100 text-green-700' :
      connectionStatus === 'disconnected' ? 'bg-yellow-100 text-yellow-700' :
      'bg-red-100 text-red-700'
    }`}>
      <span className="w-2 h-2 rounded-full bg-current"></span>
      <span className="font-medium">
        {connectionStatus === 'connected' ? 'Connected' :
         connectionStatus === 'disconnected' ? 'Disconnected' :
         'Connection Error'}
      </span>
      {reconnectAttempts > 0 && (
        <span className="text-xs ml-2">
          (Attempt {reconnectAttempts}/{MAX_RECONNECT_ATTEMPTS})
        </span>
      )}
    </div>
  );

  // Error message component
  const ErrorMessage = () => connectionError && (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md" role="alert">
      <div className="flex items-center">
        <strong className="font-bold mr-2">Error:</strong>
        <span className="block sm:inline">{connectionError}</span>
      </div>
      {reconnectAttempts > 0 && (
        <div className="mt-2 text-sm">
          Reconnecting... ({reconnectAttempts}/{MAX_RECONNECT_ATTEMPTS})
        </div>
      )}
    </div>
  );

  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
      <ErrorMessage />
      <ConnectionStatus />
      
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex"}`}>
        <div>
          <img src={logo} width={250} alt='logo' className="mb-4" />
        </div>
        <p className='text-lg mt-2 text-slate-500'>
          {connectionStatus === 'connected' 
            ? 'Select a user to start messaging'
            : connectionStatus === 'disconnected'
            ? 'Connecting to chat server...'
            : 'Having trouble connecting...'}
        </p>
        {connectionStatus === 'error' && (
          <button 
            onClick={initializeSocket}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
}

export default Home;