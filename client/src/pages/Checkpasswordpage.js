import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import axios from "axios";
import Avatar from '../component/Avatar';
import { useDispatch } from "react-redux";
import { setToken } from "../redux/userSlice";

function Checkpasswordpage() {
  const [data, setData] = useState({
    password: "",
    userId: ""
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location)

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/password`;
    try {
      const response = await axios.post(URL, {
        userId: data.userId,
        password: data.password
      }, { withCredentials: true });

      toast.success(response.data.message);

      if (response.data.success) {
        dispatch(setToken(response.data.token));// store the token to redux state
        localStorage.setItem('Token', response.data.token);
        setData({ password: "", userId: "" });
        navigate('/');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed. Please try again.");
    }
  };

  useEffect(() => {
    if (!location?.state?.name || !location?.state?._id) {
      navigate('/email');
    } else {
      setData((prev) => ({
        ...prev,
        userId: location.state._id
      }));
    }
  }, [location, navigate]);

  if (!location?.state) {
    return null; // Render nothing or a fallback UI if location.state is not defined
  }

  return (
    <div className='mt-5 bg-white w-full max-w-md mx-2 rounded overflow-hidden p-4 md:mx-auto'>
      <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
        <Avatar width={80} height={80} name={location?.state?.name} ImageUrl={location?.state?.profile_pic} />
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
              required
            />
          </div>
          <button className='bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'>
            Login
          </button>
        </form>
        <p className='my-3 text-center'>
          <Link to={'/forgot-password'} className='hover:text-primary font-semibold'>Forgot Password</Link>
        </p>
      </div>
    </div>
  );
}

export default Checkpasswordpage;
