

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


//hosted


// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { logout, setOnlineUser, setUser, setSocketConnection } from '../redux/userSlice';
// import axios from 'axios';
// import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// import Sidebar from '../component/Sidebar';
// import logo from "../assets/logo.png";
// import io from 'socket.io-client';
// import { toast } from 'react-hot-toast';

// // Constants
// const MAX_RETRIES = 3;
// const INITIAL_TIMEOUT = 10000;
// const SOCKET_URL = 'https://chathub-connect-server-19e1047470c1.herokuapp.com';

// const fetchUserDetails = async (dispatch, navigate) => {
//   let retryCount = 0;

//   const attemptFetch = async () => {
//     console.log(`[fetchUserDetails] Attempt ${retryCount + 1}/${MAX_RETRIES}`);
    
//     try {
//       const token = localStorage.getItem('Token');
//       if (!token) {
//         navigate('/email');
//         return false;
//       }

//       const response = await axios({
//         url: `${SOCKET_URL}/api/user-details`,
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         withCredentials: true,
//         timeout: INITIAL_TIMEOUT * (retryCount + 1)
//       });

//       if (response.data.data) {
//         dispatch(setUser(response.data.data));
//         return true;
//       }
//       return false;

//     } catch (error) {
//       if (error.response?.status === 401) {
//         localStorage.removeItem('Token');
//         navigate('/email');
//         return false;
//       }

//       if (retryCount < MAX_RETRIES - 1) {
//         retryCount++;
//         await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
//         return await attemptFetch();
//       }

//       toast.error('Unable to connect to server');
//       return false;
//     }
//   };

//   return await attemptFetch();
// };

// function Home() {
//   const user = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const basePath = location.pathname === '/';
  
//   const socketRef = useRef(null);
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [reconnectAttempts, setReconnectAttempts] = useState(0);

//   const cleanupSocket = useCallback(() => {
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }
//   }, []);

//   const initializeSocket = useCallback(async () => {
//     const token = localStorage.getItem('Token');
//     if (!token) {
//       navigate('/email');
//       return;
//     }
  
//     try {
//       cleanupSocket();
  
//       const socket = io(SOCKET_URL, {
//         auth: { token },
//         transports: ['polling', 'websocket'], // Important: Try polling first
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 1000,
//         timeout: 20000, // Increased timeout
//         forceNew: true,
//         withCredentials: true,
//         extraHeaders: {
//           'Authorization': `Bearer ${token}`
//         },
//         path: '/socket.io/', // Explicitly set path
//         secure: true, // For HTTPS
//         rejectUnauthorized: false // For self-signed certificates
//       });
  
//       socket.io.on("error", (error) => {
//         console.error('[Socket.IO] Transport error:', error);
//       });
  
//       socket.io.on("reconnect_attempt", (attempt) => {
//         console.log(`[Socket.IO] Reconnection attempt ${attempt}`);
//         // Use polling for reconnection attempts
//         socket.io.opts.transports = ['polling', 'websocket'];
//       });
  
//       socket.on('connect', () => {
//         console.log('[Socket] Connected successfully. ID:', socket.id);
//         setConnectionStatus('connected');
//         setReconnectAttempts(0);
//         toast.success('Connected to chat server');
//       });
  
//       socket.on('connect_error', (error) => {
//         console.error('[Socket] Connection error:', error.message);
//         setConnectionStatus('error');
        
//         const attempt = reconnectAttempts + 1;
//         setReconnectAttempts(attempt);
        
//         if (attempt >= 5) {
//           toast.error('Unable to connect to server');
//           cleanupSocket();
//         }
//       });
  
//       socket.on('disconnect', (reason) => {
//         console.log('[Socket] Disconnected. Reason:', reason);
//         setConnectionStatus('disconnected');
        
//         if (reason === 'io server disconnect') {
//           toast.error('Session expired. Please login again.');
//           dispatch(logout());
//           navigate('/email');
//         } else {
//           toast.warning('Connection lost. Reconnecting...');
//         }
//       });
  
//       // Event handlers remain the same...
  
//       socketRef.current = socket;
//       dispatch(setSocketConnection(socket));
  
//       return socket;
//     } catch (error) {
//       console.error('[Socket] Initialization error:', error);
//       toast.error('Failed to initialize chat connection');
//       return null;
//     }
//   }, [dispatch, navigate, cleanupSocket, reconnectAttempts]);

//   useEffect(() => {
//     let mounted = true;

//     const initialize = async () => {
//       if (mounted) {
//         const userFetched = await fetchUserDetails(dispatch, navigate);
//         if (userFetched && mounted) {
//           await initializeSocket();
//         }
//       }
//     };

//     initialize();

//     return () => {
//       mounted = false;
//       cleanupSocket();
//     };
//   }, [dispatch, navigate, initializeSocket, cleanupSocket]);

//   const ConnectionStatus = () => (
//     <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-full shadow-md flex items-center gap-2 ${
//       connectionStatus === 'connected' ? 'bg-green-100 text-green-700' :
//       connectionStatus === 'disconnected' ? 'bg-yellow-100 text-yellow-700' :
//       'bg-red-100 text-red-700'
//     }`}>
//       <span className="w-2 h-2 rounded-full bg-current"></span>
//       <span className="font-medium">
//         {connectionStatus === 'connected' ? 'Connected' :
//          connectionStatus === 'disconnected' ? 'Reconnecting...' :
//          'Connection Error'}
//       </span>
//       {reconnectAttempts > 0 && (
//         <span className="text-xs ml-2">
//           (Attempt {reconnectAttempts}/5)
//         </span>
//       )}
//     </div>
//   );

//   return (
//     <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
//       <ConnectionStatus />
      
//       <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
//         <Sidebar />
//       </section>

//       <section className={`${basePath && "hidden"}`}>
//         <Outlet />
//       </section>

//       <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex"}`}>
//         <div>
//           <img src={logo} width={250} alt='logo' className="mb-4" />
//         </div>
//         <p className='text-lg mt-2 text-slate-500'>
//           {connectionStatus === 'connected' 
//             ? 'Select a user to start messaging'
//             : 'Connecting to chat server...'}
//         </p>
//         {connectionStatus === 'error' && (
//           <button 
//             onClick={() => initializeSocket()}
//             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//           >
//             Retry Connection
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Home;



//second versuon


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
const MAX_RETRIES = 3;
const INITIAL_TIMEOUT = 10000;
const SOCKET_URL = 'https://chathub-connect-server-19e1047470c1.herokuapp.com';

const fetchUserDetails = async (dispatch, navigate) => {
  let retryCount = 0;

  const attemptFetch = async () => {
    console.log(`[fetchUserDetails] Attempt ${retryCount + 1}/${MAX_RETRIES}`);
    
    try {
      const token = localStorage.getItem('Token');
      if (!token) {
        navigate('/email');
        return false;
      }

      const response = await axios({
        url: `${SOCKET_URL}/api/user-details`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: INITIAL_TIMEOUT * (retryCount + 1)
      });

      if (response.data.data) {
        dispatch(setUser(response.data.data));
        return true;
      }
      return false;

    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('Token');
        navigate('/email');
        return false;
      }

      if (retryCount < MAX_RETRIES - 1) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return await attemptFetch();
      }

      toast.error('Unable to connect to server');
      return false;
    }
  };

  return await attemptFetch();
};

// ConnectionStatus Component
const ConnectionStatus = React.memo(({ connectionStatus, reconnectAttempts, initializeSocket }) => (
  <div className={`absolute top-0 left-0 right-0 p-2 text-center z-50 ${
    connectionStatus === 'connected' ? 'bg-green-100 text-green-700' :
    connectionStatus === 'disconnected' ? 'bg-yellow-100 text-yellow-700' :
    'bg-red-100 text-red-700'
  }`}>
    <div className="flex justify-center items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-current"></span>
      <span className="font-medium">
        {connectionStatus === 'connected' ? 'Connected' :
         connectionStatus === 'disconnected' ? 'Reconnecting...' :
         'Connection Error'}
      </span>
      {reconnectAttempts > 0 && (
        <span className="text-xs ml-2">
          (Attempt {reconnectAttempts}/5)
        </span>
      )}
      {connectionStatus === 'error' && (
        <button 
          onClick={initializeSocket}
          className="ml-4 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  </div>
));

function Home() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname === '/';
  
  const socketRef = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const initializeSocket = useCallback(async () => {
    const token = localStorage.getItem('Token');
    if (!token) {
      navigate('/email');
      return;
    }
  
    try {
      cleanupSocket();
  
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['polling', 'websocket'], // Important: Try polling first
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000, // Increased timeout
        forceNew: true,
        withCredentials: true,
        extraHeaders: {
          'Authorization': `Bearer ${token}`
        },
        path: '/socket.io/', // Explicitly set path
        secure: true, // For HTTPS
        rejectUnauthorized: false // For self-signed certificates
      });
  
      socket.io.on("error", (error) => {
        console.error('[Socket.IO] Transport error:', error);
      });
  
      socket.io.on("reconnect_attempt", (attempt) => {
        console.log(`[Socket.IO] Reconnection attempt ${attempt}`);
        // Use polling for reconnection attempts
        socket.io.opts.transports = ['polling', 'websocket'];
      });
  
      socket.on('connect', () => {
        console.log('[Socket] Connected successfully. ID:', socket.id);
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        toast.success('Connected to chat server');
      });
  
      socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        setConnectionStatus('error');
        
        const attempt = reconnectAttempts + 1;
        setReconnectAttempts(attempt);
        
        if (attempt >= 5) {
          toast.error('Unable to connect to server');
          cleanupSocket();
        }
      });
  
      socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected. Reason:', reason);
        setConnectionStatus('disconnected');
        
        if (reason === 'io server disconnect') {
          toast.error('Session expired. Please login again.');
          dispatch(logout());
          navigate('/email');
        } else {
          toast.warning('Connection lost. Reconnecting...');
        }
      });
  
      // Event handlers remain the same...
  
      socketRef.current = socket;
      dispatch(setSocketConnection(socket));
  
      return socket;
    } catch (error) {
      console.error('[Socket] Initialization error:', error);
      toast.error('Failed to initialize chat connection');
      return null;
    }
  }, [dispatch, navigate, cleanupSocket, reconnectAttempts]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (mounted) {
        const userFetched = await fetchUserDetails(dispatch, navigate);
        if (userFetched && mounted) {
          await initializeSocket();
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      cleanupSocket();
    };
  }, [dispatch, navigate, initializeSocket, cleanupSocket]);

  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen relative'>
      <ConnectionStatus 
        connectionStatus={connectionStatus}
        reconnectAttempts={reconnectAttempts}
        initializeSocket={initializeSocket}
      />
      
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
      </div>
    </div>
  );
}

export default Home;