// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { logout, setOnlineUser, setUser, setSocketConnection } from '../redux/userSlice';
// import axios from 'axios';
// import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// import Sidebar from '../component/Sidebar';
// import logo from "../assets/logo.png";
// import io from 'socket.io-client'

// function Home() {
//   const user = useSelector((state) => state.user);
//   console.log("user", user)
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const basePath = location.pathname === '/'; // to hide the message section when user on the home url after login


//   const fetchUserDetails = async () => {
//     try {
//       const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
//       const response = await axios({
//         url: URL,
//         withCredentials: true,
//       });
//       dispatch(setUser(response.data.data));
//       if (response.data.data.logout) {
//         dispatch(logout());
//         navigate('/email');
//       }
//       // console.log("Current user details", response);

//       // Update the user state with the fetched details
//       dispatch(setUser(response.data.data));
//     } catch (error) {
//       console.log(error.message);
//     }
    
//   };
//   useEffect(() => {
//     fetchUserDetails();
//   }, []);

  

//   useEffect(() => {
//     const token = localStorage.getItem('Token'); // Assuming you store your token in localStorage

//     const socketConnection = io(process.env.REACT_APP_BACKEND_URL, {
//       auth: {
//         token
//       }
//     });

//     socketConnection.on('Online User', (data) => {
//       console.log("Online User", data);
//       dispatch(setOnlineUser(data))
//       // Do something with the online user data received from the server
//     });
//     dispatch(setSocketConnection(socketConnection))

//     return () => {
//       socketConnection.disconnect();
//     };
//   }, []);
//   return (
//     <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
//       <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
//         <Sidebar />
//       </section>

//       {/**message component**/}
//       <section className={`${basePath && "hidden"}`} >
//         <Outlet />
//       </section>


//       <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex"}`}>
//         <div>
//           <img
//             src={logo}
//             width={250}
//             alt='logo'
//           />
//         </div>
//         <p className='text-lg mt-2 text-slate-500'>Select user to send message</p>
//       </div>
//     </div>
//   );
// }

// export default Home;

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setOnlineUser, setUser, setSocketConnection } from '../redux/userSlice';
import axios from 'axios';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../component/Sidebar';
import logo from "../assets/logo.png";
import io from 'socket.io-client';

const fetchUserDetails = async (dispatch, navigate) => {
  try {
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/user-details`;
    const response = await axios({
      url: URL,
      withCredentials: true,
    });
    dispatch(setUser(response.data.data));
    if (response.data.data.logout) {
      dispatch(logout());
      navigate('/email');
    }
    // console.log("Current user details", response);

    // Update the user state with the fetched details
    dispatch(setUser(response.data.data));
  } catch (error) {
    console.log(error.message);
  }
};

function Home() {
  const user = useSelector((state) => state.user);
  console.log("user", user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname === '/'; // to hide the message section when user on the home url after login

  useEffect(() => {
    fetchUserDetails(dispatch, navigate);
  }, [dispatch, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('Token'); // Assuming you store your token in localStorage

    const socketConnection = io(process.env.REACT_APP_BACKEND_URL, {
      auth: {
        token,
      },
    });

    socketConnection.on('Online User', (data) => {
      console.log("Online User", data);
      dispatch(setOnlineUser(data));
      // Do something with the online user data received from the server
    });
    dispatch(setSocketConnection(socketConnection));

    return () => {
      socketConnection.disconnect();
    };
  }, [dispatch]);

  return (
    <div className='grid lg:grid-cols-[300px,1fr] h-screen max-h-screen'>
      <section className={`bg-white ${!basePath && "hidden"} lg:block`}>
        <Sidebar />
      </section>

      {/**message component**/}
      <section className={`${basePath && "hidden"}`}>
        <Outlet />
      </section>

      <div className={`justify-center items-center flex-col gap-2 hidden ${!basePath ? "hidden" : "lg:flex"}`}>
        <div>
          <img src={logo} width={250} alt='logo' />
        </div>
        <p className='text-lg mt-2 text-slate-500'>Select user to send message</p>
      </div>
    </div>
  );
}

export default Home;

