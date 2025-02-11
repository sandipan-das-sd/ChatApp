

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

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setOnlineUser, setUser, setSocketConnection } from '../redux/userSlice';
import axios from 'axios';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import logo from "../assets/logo.png";
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

const fetchUserDetails = async (dispatch, navigate) => {
  try {
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
    const response = await axios({
      url: URL,
      withCredentials: true,
      timeout: 5000, // 5 second timeout
    });

    if (response.data.data) {
      dispatch(setUser(response.data.data));
      if (response.data.data.logout) {
        dispatch(logout());
        navigate('/email');
      }
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    if (error.response) {
      toast.error(error.response.data.message || 'Failed to fetch user details');
    } else if (error.request) {
      toast.error('No response from server. Please check your connection.');
    } else {
      toast.error('An error occurred while fetching user details');
    }
  }
};

function Home() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname === '/';
  
  // State for tracking connection status and errors
  const [connectionError, setConnectionError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Fetch user details on component mount
  useEffect(() => {
    fetchUserDetails(dispatch, navigate);
  }, [dispatch, navigate]);

  // Socket connection management
  useEffect(() => {
    let socketConnection = null;

    const initializeSocket = () => {
      const token = localStorage.getItem('Token');
      
      if (!token) {
        setConnectionError('No authentication token found');
        navigate('/email');
        return;
      }

      // Clear any existing errors
      setConnectionError(null);

      try {
        // Initialize socket with configuration
        socketConnection = io(process.env.REACT_APP_BACKEND_URL, {
          auth: { token },
          reconnection: true,
          reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
          reconnectionDelay: 1000,
          timeout: 10000,
          transports: ['websocket', 'polling']
        });

        // Connection event handlers
        socketConnection.on('connect', () => {
          console.log('Socket connected successfully');
          setConnectionStatus('connected');
          setConnectionError(null);
          setReconnectAttempts(0);
          toast.success('Connected to chat server');
        });

        socketConnection.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setConnectionStatus('error');
          setConnectionError(`Connection error: ${error.message}`);
          setReconnectAttempts((prev) => prev + 1);
          
          if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            toast.error('Failed to connect to chat server after multiple attempts');
            socketConnection.disconnect();
          }
        });

        socketConnection.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
          setConnectionStatus('disconnected');
          if (reason === 'io server disconnect') {
            // Server disconnected the client
            toast.error('Disconnected by server. Please check your authentication.');
            navigate('/email');
          } else {
            toast.warning('Disconnected from chat server. Attempting to reconnect...');
          }
        });

        socketConnection.on('Online User', (data) => {
          console.log('Online Users:', data);
          dispatch(setOnlineUser(data));
        });

        // Store socket connection in Redux
        dispatch(setSocketConnection(socketConnection));

      } catch (error) {
        console.error('Socket initialization error:', error);
        setConnectionError(`Failed to initialize socket: ${error.message}`);
        toast.error('Failed to initialize chat connection');
      }
    };

    initializeSocket();

    // Cleanup function
    return () => {
      if (socketConnection) {
        console.log('Cleaning up socket connection');
        socketConnection.disconnect();
      }
    };
  }, [dispatch, navigate, reconnectAttempts]);

  // Error message component
  const ConnectionErrorMessage = () => connectionError && (
    <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md" role="alert">
      <strong className="font-bold">Connection Error: </strong>
      <span className="block sm:inline">{connectionError}</span>
    </div>
  );

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className={`fixed bottom-4 right-4 px-3 py-1 rounded-full ${
      connectionStatus === 'connected' ? 'bg-green-100 text-green-700' :
      connectionStatus === 'disconnected' ? 'bg-yellow-100 text-yellow-700' :
      'bg-red-100 text-red-700'
    }`}>
      {connectionStatus === 'connected' ? '🟢 Connected' :
       connectionStatus === 'disconnected' ? '🟡 Disconnected' :
       '🔴 Error'}
    </div>
  );

  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
      <ConnectionErrorMessage />
      <ConnectionStatus />
      
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex"}`}>
        <div>
          <img src={logo} width={250} alt='logo' />
        </div>
        <p className='text-lg mt-2 text-slate-500'>
          {connectionStatus === 'connected' 
            ? 'Select user to send message'
            : 'Connecting to chat server...'}
        </p>
      </div>
    </div>
  );
}

export default Home;