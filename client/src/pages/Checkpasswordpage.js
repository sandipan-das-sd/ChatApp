// import React, { useEffect, useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { toast } from "react-hot-toast";
// import axios from "axios";
// import Avatar from '../component/Avatar';
// import { useDispatch } from "react-redux";
// import { setToken } from "../redux/userSlice";

// function Checkpasswordpage() {
//   const [data, setData] = useState({
//     password: "",
//     userId: ""
//   });
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   console.log(location)

//   const handleOnChange = (e) => {
//     const { name, value } = e.target;
//     setData((prev) => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const URL = `${process.env.REACT_APP_BACKEND_URL}/api/password`;
//     try {
//       const response = await axios.post(URL, {
//         userId: data.userId,
//         password: data.password
//       }, { withCredentials: true,

//         timeout: 5000 
//        });

//       toast.success(response.data.message);

//       // if (response.data.success) {

//       //   dispatch(setToken(response.data.token));// store the token to redux state
//       //   localStorage.setItem('Token', response.data.token);
//       //   setData({ password: "", userId: "" });
//       //   navigate('/');
//       // }
//       if (response.data.success) {
//         const token = response.data.token;
//         if (!token) {
//           throw new Error('No token received from server');
//         }
        
//         localStorage.setItem('Token', token);
//         dispatch(setToken(token));
        
//         // Verify token is stored before navigation
//         const storedToken = localStorage.getItem('Token');
//         if (storedToken) {
//           navigate('/');
//         } else {
//           throw new Error('Failed to store authentication token');
//         }
//       }
//     } 
//     // catch (error) {
//     //   toast.error(error?.response?.data?.message || "Login failed. Please try again.");
//     // }
//     catch (error) {
//       if (error.response) {
//         // Server responded with error
//         toast.error(error.response.data.message);
//       } else if (error.request) {
//         // Request made but no response
//         toast.error('No response from server. Please try again.');
//       } else {
//         // Other errors
//         toast.error('An error occurred. Please try again.');
//       }
//       console.error('Login error:', error);
//     }
//   };

//   useEffect(() => {
//     if (!location?.state?.name || !location?.state?._id) {
//       navigate('/email');
//     } else {
//       setData((prev) => ({
//         ...prev,
//         userId: location.state._id
//       }));
//     }
//   }, [location, navigate]);

//   if (!location?.state) {
//     return null; // Render nothing or a fallback UI if location.state is not defined
//   }

//   return (
//     <div className='mt-5 bg-white w-full max-w-md mx-2 rounded overflow-hidden p-4 md:mx-auto'>
//       <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
//         <Avatar width={80} height={80} name={location?.state?.name} ImageUrl={location?.state?.profile_pic} />
//         <h2 className='font-semibold text-lg mt-1'>{location?.state?.name}</h2>
//       </div>
//       <div>
//         <h3>Welcome to ChatApp</h3>
//         <form className='grid gap-3 mt-3' onSubmit={handleSubmit}>
//           <div className='flex flex-col gap-1'>
//             <label htmlFor='password'>Password</label>
//             <input
//               type='password'
//               id='password'
//               name='password'
//               placeholder='Enter your Password'
//               className='bg-slate-100 px-2 py-1 focus:outline-primary'
//               value={data.password}
//               onChange={handleOnChange}
//               required
//             />
//           </div>
//           <button className='bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'>
//             Login
//           </button>
//         </form>
//         <p className='my-3 text-center'>
//           <Link to={'/forgot-password'} className='hover:text-primary font-semibold'>Forgot Password</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// export default Checkpasswordpage;
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import axios from "axios";
import Avatar from '../component/Avatar';
import { useDispatch } from "react-redux";
import { setToken } from "../redux/userSlice";
import io from 'socket.io-client';

function Checkpasswordpage() {
  const [data, setData] = useState({
    password: "",
    userId: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const verifySocketConnection = async (token) => {
    try {
      const socket = io(process.env.REACT_APP_BACKEND_URL, {
        auth: { token },
        transports: ['polling', 'websocket'], // Try polling first, then websocket
        reconnectionAttempts: 3,
        timeout: 10000, // Increased timeout
        forceNew: true,
        withCredentials: true
      });

      return new Promise((resolve, reject) => {
        let timeoutId;

        socket.on('connect', () => {
          clearTimeout(timeoutId);
          socket.disconnect();
          resolve(true);
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connect error:', error);
          clearTimeout(timeoutId);
          socket.disconnect();
          resolve(true); // Still resolve as we'll retry in Home component
        });

        socket.on('error', (error) => {
          console.error('Socket error:', error);
          clearTimeout(timeoutId);
          socket.disconnect();
          resolve(true); // Still resolve as we'll retry in Home component
        });

        timeoutId = setTimeout(() => {
          socket.disconnect();
          resolve(true); // Still resolve as we'll retry in Home component
        }, 10000);
      });
    } catch (error) {
      console.error('Socket initialization error:', error);
      return true; // Still proceed as we'll retry in Home component
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Login Request
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/password`,
        {
          userId: data.userId,
          password: data.password
        },
        {
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data.success || !response.data.token) {
        throw new Error('Invalid server response');
      }

      const { token } = response.data;

      // 2. Store Token
      localStorage.setItem('Token', token);
      dispatch(setToken(token));

      // 3. Verify Token Storage
      const storedToken = localStorage.getItem('Token');
      if (!storedToken) {
        throw new Error('Failed to store authentication token');
      }

      // 4. Try Socket Connection (but don't block on failure)
      try {
        await verifySocketConnection(token);
      } catch (socketError) {
        console.warn('Socket verification warning:', socketError);
        // Continue anyway - we'll retry in Home component
      }

      // 5. Success - Clear form and navigate
      toast.success('Login successful');
      setData({ password: "", userId: "" });
      navigate('/', { replace: true });

    } catch (error) {
      console.error('Login error:', error);
      localStorage.removeItem('Token');
      
      if (error.response) {
        const errorMessage = error.response.data.message || 'Invalid credentials';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Server not responding. Please try again.');
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!location?.state?.name || !location?.state?._id) {
      navigate('/email');
      return;
    }

    setData(prev => ({
      ...prev,
      userId: location.state._id
    }));

    localStorage.removeItem('Token');
  }, [location, navigate]);

  if (!location?.state) {
    return null;
  }

  return (
    <div className='mt-5 bg-white w-full max-w-md mx-2 rounded overflow-hidden p-4 md:mx-auto'>
      <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
        <Avatar 
          width={80} 
          height={80} 
          name={location?.state?.name} 
          ImageUrl={location?.state?.profile_pic} 
        />
        <h2 className='font-semibold text-lg mt-1'>{location?.state?.name}</h2>
      </div>
      <div>
        <h3>Welcome to ChatApp</h3>
        <form className='grid gap-3 mt-3' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              name='password'
              placeholder='Enter your Password'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.password}
              onChange={handleOnChange}
              disabled={isLoading}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className={`bg-primary text-lg px-4 py-1 rounded mt-2 font-bold text-white leading-relaxed tracking-wide
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary'}`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className='my-3 text-center'>
          <Link to={'/forgot-password'} className='hover:text-primary font-semibold'>
            Forgot Password
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Checkpasswordpage;