
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaAngleLeft } from "react-icons/fa6";
import { FaRegImage } from "react-icons/fa6";
import { FaVideo } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import Avatar from "./Avatar"
import uploadFiles from '../helpers/uploadFiles';

function MessagePage() {
  const params = useParams();
  const socketConnection = useSelector(state => state.user?.socketConnection);
  const user = useSelector(state => state?.user)
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: ""
  });
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: ""
  });
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);

  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload(prev => !prev);
  };

  const handelUploadImage = async (e) => {
    // Handle image upload

    const file = e.target.files[0];
    const uploadPhoto = await uploadFiles(file);

    setMessage(prev => ({
      ...prev,
      imageUrl: uploadPhoto.url
    }));
  };
  const handelClearUploadImage=async(e)=>{
    

    setMessage(prev => ({
      ...prev,
      imageUrl: ""
    }));
  }

  const handelUploadVideo = async (e) => {
    const file = e.target.files[0];
    const uploadVideo = await uploadFiles(file);

    setMessage(prev => ({
      ...prev,
      videoUrl: uploadVideo.url
    }));
  };
  const handelClearUploadVideo=async(e)=>{
    setMessage(prev => ({
      ...prev,
      videoUrl: ""
    }));
  }
  useEffect(() => {
    if (socketConnection) {
      console.log('Socket connection established:', socketConnection.id);
      socketConnection.emit('message-page', params.userId);
      socketConnection.on('message-user', (data) => {
        setDataUser(data);
      });
    } else {
      console.log('Socket connection not established');
    }
  }, [socketConnection, params.userId, user]);

  return (
    <div>
      {/* Header */}
      <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
        <div className='flex items-center gap-4'>
          <Link to={"/"} className='lg:hidden'>
            <FaAngleLeft size={25} />
          </Link>
          <div>
            <Avatar
              width={50}
              height={50}
              ImageUrl={dataUser?.profile_pic}  // Corrected prop name: imageUrl
              name={dataUser?.name}
              userId={dataUser?._id}
            />

          </div>
          <div>
            <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>
            <p className='-my-2 text-sm'>
              {dataUser.online ? <span className='text-primary'>Online</span> : <span className='text slate-400'>Offline</span>}
            </p>
          </div>
        </div>
        <div>
          <button className='cursor-pointer hover:text-primary '>
            <BsThreeDotsVertical />
          </button>
        </div>
      </header>

      {/* Show All message */}
      <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scroolbar relative'>
        Show All Messages

        {/* Upload Image Display */}
        {
          message.imageUrl && (
            <div className='w-full h-full bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-5 right-0 cursor-pointer hover:text-red-600' onClick={handelClearUploadImage}>
              <RxCross2
              size={30} />
              </div>
              <div className='bg-white p-3'>
                <img
                  src={message.imageUrl}
                  
                  alt='uploadImage'
                  className='aspect-square  w-full max-w-sm m-2 object-scale-down'
                  controls
                  muted
                  autoPlay
                />
                
              </div>

            </div>
          )
        }


         {/* Upload Video  Display */}
         {
          message.videoUrl && (
            <div className='w-full h-full bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
              <div className='w-fit p-2 absolute top-5 right-0 cursor-pointer hover:text-red-600' onClick={handelClearUploadVideo}>
              <RxCross2
              size={30} />
              </div>
              <div className='bg-white p-3'>
                <video
                  src={message.videoUrl}
                  
                  alt='uploadVideo'
                  className='aspect-square w-full max-w-sm m-2 object-scale-down'
                  controls
                  muted
                  autoPlay
                />
              </div>

            </div>
          )
        }


      </section>

      {/* Send Messages */}
      <section className='h-16 bg-white flex items-center px-4'>
        <div className='relative'>
          <button onClick={handleUploadImageVideoOpen} className='flex justify-center w-11 h-11 rounded-full hover:bg-primary hover:text-white'>
            <FaPlus size={20} />
          </button>
          {/* Video Add Images */}
          {openImageVideoUpload && (
            <div className='bg-white shadow rounded absolute bottom-14 w-36 p-2'>
              <form>
                <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
                  <div className='text-primary'>
                    <FaRegImage size={18} />
                  </div>
                  <p>Image</p>
                </label>
                <label htmlFor='uploadVideo' className='flex items-center p-2 gap-3 px-3 hover:bg-slate-200 cursor-pointer'>
                  <div className='text-purple-500 '>
                    <FaVideo size={18} />
                  </div>
                  <p>Video</p>
                </label>
                <input
                  type='file'
                  id='uploadImage'
                  accept='.jpg, .jpeg, .png, .gif, .bmp, .tiff, 
                  .tif, .webp, .svg, .heic, .heif'
                  onChange={handelUploadImage}
                />
                <input
                  type='file'
                   accept=".mp4, .mkv, .avi, .mov, .wmv, 
                   .flv, .webm, .m4v, .mpeg, .mpg, .ogv, .3gp, .3g2"
                  id='uploadVideo'
                  onChange={handelUploadVideo}
                />
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default MessagePage;
