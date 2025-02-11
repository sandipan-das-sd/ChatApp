

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


import React, { useEffect, useState, useCallback, useRef } from 'react';
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

const fetchUserDetails = async (dispatch, navigate) => {
  console.log('[fetchUserDetails] Starting user details fetch...');
  
  try {
    const token = localStorage.getItem('Token');
    if (!token) {
      console.warn('[fetchUserDetails] No token found in localStorage');
      throw new Error('No authentication token found');
    }

    const URL = 'https://chathub-connect-server-19e1047470c1.herokuapp.com/api/user-details';
    console.log('[fetchUserDetails] Fetching from URL:', URL);

    const response = await axios({
      url: URL,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      withCredentials: true,
      timeout: FETCH_TIMEOUT
    });

    console.log('[fetchUserDetails] Response received:', response.data);

    if (response.data.data) {
      dispatch(setUser(response.data.data));
      return true;
    }
    return false;
  } catch (error) {
    console.error('[fetchUserDetails] Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('Token');
      navigate('/email');
    }
    return false;
  }
};

function Home() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname === '/';
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('[cleanup] Disconnecting socket:', socketRef.current.id);
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const initializeSocket = useCallback(async () => {
    console.log('[initializeSocket] Starting socket initialization...');
    
    const token = localStorage.getItem('Token');
    if (!token) {
      console.error('[initializeSocket] No token found');
      navigate('/email');
      return;
    }

    try {
      // Clean up existing socket
      cleanupSocket();

      const SOCKET_URL = process.env.REACT_APP_BACKEND_URL;
      console.log('[initializeSocket] Attempting connection to:', SOCKET_URL);

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        timeout: SOCKET_TIMEOUT,
        withCredentials: true
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected successfully. Socket ID:', socket.id);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        toast.success('Connected to chat server');
      });

      socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        setConnectionStatus('error');
        
        const attemptCount = reconnectAttempts + 1;
        setReconnectAttempts(attemptCount);
        
        if (attemptCount >= MAX_RECONNECT_ATTEMPTS) {
          toast.error('Unable to connect to server. Please try again later.');
          cleanupSocket();
        } else {
          // Implement exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attemptCount), 10000);
          reconnectTimeoutRef.current = setTimeout(() => {
            initializeSocket();
          }, delay);
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected. Reason:', reason);
        setConnectionStatus('disconnected');
        
        if (reason === 'io server disconnect') {
          toast.error('Disconnected by server. Please login again.');
          dispatch(logout());
          navigate('/email');
        } else {
          toast.warning('Connection lost. Attempting to reconnect...');
        }
      });

      socket.on('Online User', (data) => {
        console.log('[Socket] Online users updated:', data);
        dispatch(setOnlineUser(data));
      });

      socketRef.current = socket;
      dispatch(setSocketConnection(socket));

    } catch (error) {
      console.error('[initializeSocket] Error:', error);
      toast.error('Failed to initialize chat connection');
    }
  }, [dispatch, navigate, cleanupSocket, reconnectAttempts]);

  useEffect(() => {
    console.log('[Home] Component mounted');
    let isMounted = true;

    const initialize = async () => {
      const userFetched = await fetchUserDetails(dispatch, navigate);
      if (userFetched && isMounted) {
        await initializeSocket();
      }
    };

    initialize();

    return () => {
      console.log('[Home] Component unmounting');
      isMounted = false;
      cleanupSocket();
    };
  }, [dispatch, navigate, initializeSocket, cleanupSocket]);

  const ConnectionStatus = () => (
    <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-full shadow-md flex items-center gap-2 ${
      connectionStatus === 'connected' ? 'bg-green-100 text-green-700' :
      connectionStatus === 'disconnected' ? 'bg-yellow-100 text-yellow-700' :
      'bg-red-100 text-red-700'
    }`}>
      <span className="w-2 h-2 rounded-full bg-current"></span>
      <span className="font-medium">
        {connectionStatus === 'connected' ? 'Connected' :
         connectionStatus === 'disconnected' ? 'Reconnecting...' :
         'Connection Error'}
      </span>
      {reconnectAttempts > 0 && (
        <span className="text-xs ml-2">
          (Attempt {reconnectAttempts}/{MAX_RECONNECT_ATTEMPTS})
        </span>
      )}
    </div>
  );

  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
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
            : 'Connecting to chat server...'}
        </p>
        {connectionStatus === 'error' && (
          <button 
            onClick={() => initializeSocket()}
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