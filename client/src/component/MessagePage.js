
// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { Link, useParams } from 'react-router-dom';
// import { BsThreeDotsVertical } from "react-icons/bs";
// import { FaAngleLeft } from "react-icons/fa6";
// import { FaRegImage } from "react-icons/fa6";
// import { FaVideo } from "react-icons/fa";
// import { FaPlus } from "react-icons/fa";
// import { RxCross2 } from "react-icons/rx";
// import Avatar from "./Avatar"
// import uploadFiles from '../helpers/uploadFiles';
// import Loading from './Loading';
// import backgroundImage from "./../assets/wallapaper.jpeg"
// import { LuSendHorizonal } from "react-icons/lu";
// function MessagePage() {
//   const params = useParams();
//   const socketConnection = useSelector(state => state.user?.socketConnection);
//   const user = useSelector(state => state?.user)
//   const [dataUser, setDataUser] = useState({
//     name: "",
//     email: "",
//     profile_pic: "",
//     online: false,
//     _id: ""
//   });

//   const [message, setMessage] = useState({
//     text: "",
//     imageUrl: "",
//     videoUrl: ""
//   });
//   const [loading, SetLoading] = useState(false)
//   const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);

//   const handleUploadImageVideoOpen = () => {
//     setOpenImageVideoUpload(prev => !prev);
//   };

//   const handelUploadImage = async (e) => {
//     // Handle image upload
//     SetLoading(true)
//     const file = e.target.files[0];
//     const uploadPhoto = await uploadFiles(file);
//     SetLoading(false)
//     setOpenImageVideoUpload(false)
//     setMessage(prev => ({
//       ...prev,
//       imageUrl: uploadPhoto.url
//     }));
//   };
//   const handelClearUploadImage = async (e) => {


//     setMessage(prev => ({
//       ...prev,
//       imageUrl: ""
//     }));
//   }

//   const handelUploadVideo = async (e) => {
//     SetLoading(true)
//     const file = e.target.files[0];
//     const uploadVideo = await uploadFiles(file);
//     SetLoading(false)
//     setOpenImageVideoUpload(false)
//     setMessage(prev => ({
//       ...prev,
//       videoUrl: uploadVideo.url
//     }));
//   };
//   const handelClearUploadVideo = async (e) => {
//     setMessage(prev => ({
//       ...prev,
//       videoUrl: ""
//     }));
//   }
//   useEffect(() => {
//     if (socketConnection) {
//       console.log('Socket connection established:', socketConnection.id);
//       socketConnection.emit('message-page', params.userId);
//       socketConnection.on('message-user', (data) => {
//         setDataUser(data);
//       });
//     } else {
//       console.log('Socket connection not established');
//     }
//   }, [socketConnection, params.userId, user]);



//   const handelOnChange = (e)=>{
//     const { name, value} = e.target

//     setMessage(preve => {
//       return{
//         ...preve,
//         text : value
//       }
//     })
//   }

// const handelSendMessage=(e)=>{
//   e.preventDefault();
//   if(message.text || message.imageUrl || message.videoUrl)
//     {
//       if(socketConnection)
//         {
//           //Send the message from the front end to backend
//           socketConnection.emit('new message',{
//             sender:user?._id,
//             receiver:params.userId,
//             text:message.text,
//             imageUrl:message.imageUrl,
//             videoUrl:message.videoUrl

//           })
//         }
//     }
// }
//   return (
//     <div style={{
//       backgroundImage: `url(${backgroundImage}) `

//     }} className=' bg-no-repeat  bg-cover bg-slate-200 bg-opacity-50'>
//       {/* Header */}
//       <header className='sticky top-0 h-16 bg-white flex justify-between items-center px-4'>
//         <div className='flex items-center gap-4'>
//           <Link to={"/"} className='lg:hidden'>
//             <FaAngleLeft size={25} />
//           </Link>
//           <div>
//             <Avatar
//               width={50}
//               height={50}
//               ImageUrl={dataUser?.profile_pic}  // Corrected prop name: imageUrl
//               name={dataUser?.name}
//               userId={dataUser?._id}
//             />

//           </div>
//           <div>
//             <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>
//             <p className='-my-2 text-sm'>
//               {dataUser.online ? <span className='text-primary'>Online</span> : <span className='text slate-400'>Offline</span>}
//             </p>
//           </div>
//         </div>
//         <div>
//           <button className='cursor-pointer hover:text-primary '>
//             <BsThreeDotsVertical />
//           </button>
//         </div>
//       </header>

//       {/* Show All message */}
//       <section className='h-[calc(100vh-128px)] overflow-x-hidden overflow-y-scroll scroolbar relative'>
//         Show All Messages

//         {/* Upload Image Display */}
//         {
//           message.imageUrl && (
//             <div className='w-full h-full bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
//               <div className='w-fit p-2 absolute top-5 right-0 cursor-pointer hover:text-red-600' onClick={handelClearUploadImage}>
//                 <RxCross2
//                   size={30} />
//               </div>
//               <div className='bg-white p-3'>
//                 <img
//                   src={message.imageUrl}

//                   alt='uploadImage'
//                   className='aspect-square  w-full max-w-sm m-2 object-scale-down'
//                   controls
//                   muted
//                   autoPlay
//                 />

//               </div>

//             </div>
//           )
//         }


//         {/* Upload Video  Display */}
//         {
//           message.videoUrl && (
//             <div className='w-full h-full bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
//               <div className='w-fit p-2 absolute top-5 right-0 cursor-pointer hover:text-red-600' onClick={handelClearUploadVideo}>
//                 <RxCross2
//                   size={30} />
//               </div>
//               <div className='bg-white p-3'>
//                 <video
//                   src={message.videoUrl}

//                   alt='uploadVideo'
//                   className='aspect-square w-full max-w-sm m-2 object-scale-down'
//                   controls
//                   muted
//                   autoPlay
//                 />
//               </div>

//             </div>
//           )
//         }

//         {
//           loading && (
//             <div className='w-full h-full flex justify-center items-center'>
//               <Loading />
//             </div>
//           )
//         }
//       </section>

//       {/* Send Messages */}
//       <section className='h-16 bg-white flex items-center px-4'>
//         <div className='relative'>
//           <button
//             onClick={handleUploadImageVideoOpen}
//             className="flex items-center justify-center w-11 h-11 rounded-full bg-gray-200 hover:bg-primary hover:text-white "
//           >
//             <FaPlus size={20} />
//           </button>
//           {/* Video Add Images */}
//           {openImageVideoUpload && (
//             <div className='bg-white shadow rounded absolute bottom-14 w-36 p-2'>
//               <form>
//                 <label htmlFor='uploadImage' className='flex items-center p-2 px-3 gap-3 hover:bg-slate-200 cursor-pointer'>
//                   <div className='text-primary'>
//                     <FaRegImage size={18} />
//                   </div>
//                   <p>Image</p>
//                 </label>
//                 <label htmlFor='uploadVideo' className='flex items-center p-2 gap-3 px-3 hover:bg-slate-200 cursor-pointer'>
//                   <div className='text-purple-500 '>
//                     <FaVideo size={18} />
//                   </div>
//                   <p>Video</p>
//                 </label>
//                 <input
//                   type='file'
//                   id='uploadImage'
//                   accept='.jpg, .jpeg, .png, .gif, .bmp, .tiff, 
//                   .tif, .webp, .svg, .heic, .heif'
//                   onChange={handelUploadImage}
//                   className='hidden'
//                 />
//                 <input
//                   type='file'
//                   accept=".mp4, .mkv, .avi, .mov, .wmv, 
//                    .flv, .webm, .m4v, .mpeg, .mpg, .ogv, .3gp, .3g2"
//                   id='uploadVideo'
//                   onChange={handelUploadVideo}
//                   className='hidden'
//                 />
//               </form>
//             </div>
//           )}
//         </div>

//         {/* Type a message  Input Box */}
//         <form  className='h-full w-full flex gap-2' onSubmit={handelSendMessage}>


//             <input
//               type='text'
//               placeholder='Type a message...'
//               className='py-1 px-4 outline-none w-full h-full '
//               value={message.text}
//               onChange={handelOnChange}
//             />
//             <button className='text-primary hover:text-secondary'>
//             <LuSendHorizonal 
//             size={30}
//             />
//             </button>



//         </form>
//       </section>
//     </div>
//   );
// }

// export default MessagePage;


import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaAngleLeft, FaRegImage, FaVideo, FaPlus, FaMicrophone, FaStop, FaTrash } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import Avatar from "./Avatar";
import uploadFiles from '../helpers/uploadFiles';
import Loading from './Loading';
import backgroundImage from "./../assets/wallapaper.jpeg";
import { LuSendHorizonal } from "react-icons/lu";
import moment from 'moment'

function MessagePage() {
  const params = useParams();
  const socketConnection = useSelector(state => state.user?.socketConnection);
  const user = useSelector(state => state?.user);
  const [dataUser, setDataUser] = useState({
    name: "",
    email: "",
    profile_pic: "",
    online: false,
    _id: "",
    // seen:false,
    // deliverd:false
  });

  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
    audioUrl: ""
  });
  const [loading, setLoading] = useState(false);
  const [openImageVideoUpload, setOpenImageVideoUpload] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [allMessage, setAllMessage] = useState([])
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  //for Currenrmessage showing to the top user have not to scrool
  const lastMessageRef = useRef(null);




  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [allMessage]);


  const handleUploadImageVideoOpen = () => {
    setOpenImageVideoUpload(prev => !prev);
  };

  const handleUploadImage = async (e) => {
    setLoading(true);
    const file = e.target.files[0];
    const uploadPhoto = await uploadFiles(file);
    setLoading(false);

    setOpenImageVideoUpload(false);
    setMessage(prev => ({
      ...prev,
      imageUrl: uploadPhoto.url
    }));
  };

  const handleClearUploadImage = async (e) => {
    setMessage(prev => ({
      ...prev,
      imageUrl: ""
    }));
  };

  const handleUploadVideo = async (e) => {
    setLoading(true);
    const file = e.target.files[0];
    const uploadVideo = await uploadFiles(file);
    setLoading(false);
    setOpenImageVideoUpload(false);
    setMessage(prev => ({
      ...prev,
      videoUrl: uploadVideo.url
    }));
  };
  const handelUploadAudio = async (e) => {
    setLoading(true);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const uploadAudio = await uploadFiles(file, 'audio');
      setLoading(false);
      // Update the audioUrl property, not videoUrl
      setMessage(prev => ({
        ...prev,
        audioUrl: uploadAudio.url // Change videoUrl to audioUrl
      }));
    } else {
      console.error('No audio files selected.');
    }
  };


  const handleClearUploadVideo = async (e) => {
    setMessage(prev => ({
      ...prev,
      videoUrl: ""
    }));
  };

  useEffect(() => {
    if (socketConnection) {
      console.log('Socket connection established:', socketConnection.id);
      socketConnection.emit('message-page', params.userId);
      socketConnection.emit('seen', params.userId)
     

      const handleMessageUser = (data) => {
        setDataUser(data);
        console.log('User Data:', data);
      };

      const handleMessage = (data) => {
        console.log('Message Array:', data);
        setAllMessage(data)
      };

      // const handleDeliveryStatus = (data) => {
      //   console.log('Delivery Status:', data);
      //   // Update the message delivery status in your state
      //   setDataUser(data)
      // };

      // const handleSeenStatus = (data) => {
      //   console.log('Seen Status:', data);
      //   // Update the message seen status in your state
      //   setDataUser(data)
      // };

      // socketConnection.on('delivery-status', handleDeliveryStatus);
      // socketConnection.on('seen-status', handleSeenStatus);

      socketConnection.emit('message-page', params.userId);

      socketConnection.on('message-user', handleMessageUser);
      socketConnection.on('message', handleMessage);

      return () => {
        socketConnection.off('message-user', handleMessageUser);
        socketConnection.off('message', handleMessage);
        //   socketConnection.off('delivery-status', handleDeliveryStatus);
        // socketConnection.off('seen-status', handleSeenStatus);
      };
    } else {
      console.log('Socket connection not established');
    }
  }, [socketConnection, params.userId, user]);

  // Function to mark messages as seen
  // const markMessageAsSeen = (messageId) => {
  //   if (socketConnection) {
  //     socketConnection.emit('message seen', {
  //       messageId,
  //       receiver: user?._id,
  //       sender: params.userId
  //     });
  //   }
  // };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setMessage(prev => ({
      ...prev,
      text: value
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.text || message.imageUrl || message.videoUrl || message.audioUrl) {
      if (socketConnection) {
        socketConnection.emit('new message', {
          sender: user?._id,
          receiver: params.userId,
          text: message.text,
          imageUrl: message.imageUrl,
          videoUrl: message.videoUrl,
          audioUrl: message.audioUrl,
          msgByUserId: user?._id
        });
        setMessage({
          text: "",
          imageUrl: "",
          videoUrl: "",
          audioUrl: ""
        })
        console.log("Sender ID:", user?._id);
        console.log("Receiver ID:", params.userId);
        // Clear message after sending
        socketConnection.on('Online User', (onlineUsers) => {
          console.log('Received online users:', onlineUsers);
          // Update Redux state or component state with onlineUsers
        });

        setMessage({ text: "", imageUrl: "", videoUrl: "", audioUrl: "" });
      }
    }
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        recorder.start();
        setIsRecording(true);

        recorder.ondataavailable = (e) => {
          setAudioChunks(prev => [...prev, e.data]);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioFile = new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
          const uploadAudio = await uploadFiles(audioFile);
          setMessage(prev => ({
            ...prev,
            audioUrl: uploadAudio.url
          }));
          setAudioChunks([]);
        };
      });
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleAudioButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  const handelShowRecordTime = () => {
    function constRecordtimeDiv() {
      <div className='fixed bottom-2 right-10 transform -translate-x-1/2  p-3'>
        Recording: {Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}
      </div>
    }
  }
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  return (
    <div style={{ backgroundImage: `url(${backgroundImage}) ` }} className='bg-no-repeat bg-cover bg-slate-200 bg-opacity-50'>
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
              ImageUrl={dataUser?.profile_pic}
              name={dataUser?.name}
              userId={dataUser?._id}
            />
          </div>
          <div>
            <h3 className='font-semibold text-lg my-0 text-ellipsis line-clamp-1'>{dataUser?.name}</h3>
            <p className='-my-2 text-sm'>
              {dataUser.online ? <span className='text-primary'>Online</span> : <span className='text slate-400'>Offline</span>}
            </p>

{/* <p className='-my-2 text-sm'>
  {dataUser.online ? <span className='text-primary'>Online</span> : (
    dataUser.lastSeen ? <span className='text-slate-400'>Last seen {moment(dataUser.lastSeen).fromNow()}</span> : <span className='text-slate-400'>Offline</span>
  )}
</p> */}



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




        {/**all message show here */}
        <div className='flex flex-col gap-2 py-2 mx-2' ref={lastMessageRef}>
          {/* {
                      allMessage.map((msg,index)=>{
                        return(
                          <div className={`  p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${user._id === msg?.msgByUserId ? "ml-auto bg-teal-100" : "bg-white"}`}>
                            <div className='w-full relative'>
                              {
                                msg?.imageUrl && (
                                  <img 
                                    src={msg?.imageUrl}
                                    alt='sentImage'
                                    className='w-full h-full object-scale-down'
                                  />
                                )
                              }
                              {
                                msg?.videoUrl && (
                                  <video
                                    src={msg.videoUrl}
                                    className='w-full h-full object-scale-down'
                                    controls
                                  />
                                )
                              }
                            </div>
                            <p className='px-2'>{msg.text}</p>
                            <p className='text-xs ml-auto w-fit'>{moment(msg.createdAt).format('hh:mm')}</p>
                          </div>
                        )
                      })
                    } */}


          {
            allMessage.map((msg, index) => {
              const isSender = user._id === msg?.msgByUserId;
              return (
                <div key={index} className={`p-1 py-1 rounded w-fit max-w-[280px] md:max-w-sm lg:max-w-md ${isSender ? "ml-auto bg-teal-100" : "bg-white"}`}>
                  <div className='w-full relative'>
                    {msg?.imageUrl && (
                      <img
                        src={msg?.imageUrl}
                        alt='sentImage'
                        className='w-full h-full object-scale-down'
                      />
                    )}
                    {msg?.videoUrl && (
                      <video
                        src={msg.videoUrl}
                        className='w-full h-full object-scale-down'
                        controls
                      />
                    )}
                  </div>
                  <p className='px-2'>{msg.text}</p>
                  <div className='flex items-center justify-end space-x-1'>
                    <p className='text-xs'>{moment(msg.createdAt).format('hh:mm')}</p>
                    {isSender && (
                      <div className='flex items-center'>
                        {msg.seen ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 13l4 4L23 7" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          }

        </div>

        {/* Upload Image Display */}
        {message.imageUrl && (
          <div className='w-full h-full  sticky bottom-0  bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className='w-fit p-2 absolute top-5 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadImage}>
              <RxCross2 size={30} />
            </div>
            <div className='bg-white p-3'>
              <img
                src={message.imageUrl}
                alt='uploadImage'
                className='aspect-square  w-full max-w-sm m-2 object-scale-down'
              />
            </div>
          </div>
        )}

        {/* Upload Video Display */}
        {message.videoUrl && (
          <div className='w-full h-full sticky bottom-0 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded overflow-hidden'>
            <div className='w-fit p-2 absolute top-5 right-0 cursor-pointer hover:text-red-600' onClick={handleClearUploadVideo}>
              <RxCross2 size={30} />
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
        )}

        {loading && (
          <div className='w-full h-full sticky bottom-0 flex justify-center items-center'>
            <Loading />
          </div>
        )}

      </section>

      {/* Send Messages */}
      <section className='h-16 bg-white flex items-center px-4'>
        <div className='relative'>
          <button
            onClick={handleUploadImageVideoOpen}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-gray-200 hover:bg-primary hover:text-white "
          >
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
                  onChange={handleUploadImage}
                  className='hidden'
                />
                <input
                  type='file'
                  accept=".mp4, .mkv, .avi, .mov, .wmv, 
                   .flv, .webm, .m4v, .mpeg, .mpg, .ogv, .3gp, .3g2"
                  id='uploadVideo'
                  onChange={handleUploadVideo}
                  className='hidden'
                />
              </form>
            </div>
          )}
        </div>

        {/* Type a message Input Box */}
        <form className='h-full w-full flex gap-2' onSubmit={handleSendMessage}>
          <input
            type='text'
            placeholder='Type a message...'
            className='py-1 px-4 outline-none w-full h-full '
            value={message.text}
            onChange={handleOnChange}
          />

          {/* Audio Recording Button */}

          {message.text.length === 0 && !message.imageUrl && !message.videoUrl && !message.audioUrl && (
            // Show audio button
            <button
              type='button'
              className={`flex items-center justify-center w-11 h-11 mt-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-200'} hover:bg-primary hover:text-white`}
              onClick={handleAudioButtonClick}
              disabled={!!message.text || !!message.imageUrl || !!message.videoUrl}
            >
              {isRecording ?
                <LuSendHorizonal size={20}
                />
                :
                <FaMicrophone size={20} onClick={handelUploadAudio} />}
            </button>

          )}

          {message.text.length > 0 || message.imageUrl || message.videoUrl || message.audioUrl ? (
            // Show send message button
            <button
              className='text-primary hover:text-secondary'
              type='submit'
              disabled={!(message.text || message.imageUrl || message.videoUrl || message.audioUrl)}
            >
              <LuSendHorizonal size={30} />
            </button>
          ) : null}

        </form>
      </section>

      {/* Timer Display for Recording */}
      {isRecording && (
        <div className='fixed bottom-2 right-10 transform -translate-x-1/2  p-3'>
          Recording: {Math.floor(timer / 60)}:{timer % 60 < 10 ? '0' : ''}{timer % 60}
          <span className='inline-flex ml-6 cursor-pointer' onClick={() => {
            setIsRecording(false)
            stopRecording()
          }} > <FaTrash /></span>
        </div>



      )}
    </div>
  );
}

export default MessagePage;




