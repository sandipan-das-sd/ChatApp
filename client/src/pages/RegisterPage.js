import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFiles from '../helpers/uploadFiles';
import { toast } from "react-hot-toast";
import axios from "axios";

function RegisterPage() {
  const handleGoogleRegister = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
  };
  
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: ""
  });
  const [uploadPhoto, setUploadPhoto] = useState(null);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadResponse = await uploadFiles(file);
    setData((prev) => ({
      ...prev,
      profile_pic: uploadResponse.secure_url
    }));

    setUploadPhoto({
      url: uploadResponse.secure_url,
      name: file.name
    });
    toast.success("Photo uploaded successfully");
  };

  const handleClearUploadPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setUploadPhoto(null);
    setData((prev) => ({
      ...prev,
      profile_pic: ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Data:", data);
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/register`;
    try {
      const response = await axios.post(URL, data);
      // console.log("Response:", response.data.data);
      // console.log("Backend URL:", process.env.REACT_APP_BACKEND_URL);

      toast.success(response.data.message);
      if(response.data.success)
        {
          setData({
            name: "",
            email: "",
            password: "",
            profile_pic: ""
          })
          navigate('/email')
        }
    } catch (error) {
      console.log("Error:", error);
      toast.error(error?.response?.data?.message || "Registration failed. Please try again.");
    }
  };
  const navigate=useNavigate()

  return (
    <div className='mt-5 bg-white w-full max-w-md mx-2 rounded overflow-hidden p-4 md:mx-auto'>
      <div>
        <h3>Welcome to ChatApp</h3>
        <form className='grid gap-3 mt-5' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-1'>
            <label htmlFor='name'>
              Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              placeholder='Enter your name'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.name}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='email'>
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              placeholder='Enter your Email'
              className='bg-slate-100 px-2 py-1 focus:outline-primary'
              value={data.email}
              onChange={handleOnChange}
              required
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label htmlFor='password'>
              Password
            </label>
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
          <div className='flex flex-col gap-1'>
            <label htmlFor='profile_pic'>
              Photo:
              <div className='h-14 bg-slate-200 flex justify-center items-center border rounded hover:border-primary cursor-pointer'>
                <p className='text-sm max-w-[300px] text-ellipsis line-clamp-1'>
                  {uploadPhoto ? uploadPhoto.name : "Upload Profile Photo"}
                </p>
                {uploadPhoto && (
                  <button className='text-lg ml-2 hover:text-red-600' onClick={handleClearUploadPhoto}>
                    <IoClose />
                  </button>
                )}
              </div>
            </label>
            <input
              type='file'
              id='profile_pic'
              name='profile_pic'
              className='bg-slate-100 px-2 py-1 focus:outline-primary hidden'
              onChange={handleUploadPhoto}
              required
            />
          </div>
          <button
            className='bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'
          >
            Register
          </button>
          <button
  className='bg-primary text-lg px-4 py-1 hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide'
  onClick={handleGoogleRegister}
>
  Register with Google
</button>

        </form>
        <p className='my-3 text-center'>Already have an account? <Link to={'/login'} className='hover:text-primary font-semibold'>Login</Link></p>
      </div>
    </div>
  );
}

export default RegisterPage;
