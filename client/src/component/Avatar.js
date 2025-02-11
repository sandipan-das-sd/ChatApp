// import React from 'react';
// import { LuUserCircle2 } from 'react-icons/lu';
// import { useSelector } from "react-redux"
// function Avatar({ userId, name, ImageUrl, width, height }) {
//     let avatarName = "";
//     const onlineUser = useSelector(state => state?.user?.onlineUser)
//     if (name) {
//         const splitName = name.split(" ");
//         if (splitName.length > 1) {
//             avatarName = splitName[0][0] + splitName[1][0];
//         } else {
//             avatarName = splitName[0][0];
//         }
//     }

//     const bgColor = [
//         'bg-slate-200',
//         'bg-teal-200',
//         'bg-red-200',
//         'bg-green-200',
//         'bg-yellow-200'
//     ];

//     const randomIndex = Math.floor(Math.random() * bgColor.length);
//     const selectedBgColor = bgColor[randomIndex];
//     const isOnline = onlineUser.includes(userId)
//     return (
//         <div
//             className="text-slate-800 rounded-full font-bold flex items-center justify-center relative"
//             style={{ width: `${width}px`, height: `${height}px` }}
//         >
//             {ImageUrl ? (
//                 <img
//                     src={ImageUrl}
//                     alt={name}
//                     className="rounded-full"
//                     style={{ width: `${width}px`, height: `${height}px` }}
//                 />
//             ) : (
//                 name ? (
//                     <div
//                         className={`overflow-hidden flex items-center justify-center rounded-full text-lg ${selectedBgColor}`}
//                         style={{ width: `${width}px`, height: `${height}px` }}
//                     >
//                         {avatarName}
//                     </div>
//                 ) : (
//                     <LuUserCircle2 size={Math.min(width, height)} />
//                 )
//             )}
//             {
//                 isOnline && (
//                     <div className='bg-green-600 p-1 absolute bottom-2 -right-1 z-10 rounded-full'></div>
//                 )
//             }

//         </div>
//     );
// }

// export default Avatar;
import React, { useMemo } from 'react';
import { LuUserCircle2 } from 'react-icons/lu';
import { useSelector } from "react-redux";

function Avatar({ userId, name, ImageUrl, width, height }) {
    const onlineUsers = useSelector(state => state?.user?.onlineUser || []);
    
    const avatarName = useMemo(() => {
        if (!name) return '';
        const splitName = name.split(" ");
        if (splitName.length > 1) {
            return splitName[0][0] + splitName[1][0];
        }
        return splitName[0][0];
    }, [name]);

    const bgColor = useMemo(() => {
        const colors = [
            'bg-slate-200',
            'bg-teal-200',
            'bg-red-200',
            'bg-green-200',
            'bg-yellow-200'
        ];
        // Use userId to get consistent color for same user
        const index = userId ? 
            userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length :
            Math.floor(Math.random() * colors.length);
        return colors[index];
    }, [userId]);

    const isOnline = userId && onlineUsers.includes(userId);

    return (
        <div
            className="text-slate-800 rounded-full font-bold flex items-center justify-center relative"
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            {ImageUrl ? (
                <img
                    src={ImageUrl}
                    alt={name}
                    className="rounded-full w-full h-full object-cover"
                />
            ) : name ? (
                <div
                    className={`overflow-hidden flex items-center justify-center rounded-full text-lg ${bgColor}`}
                    style={{ width: `${width}px`, height: `${height}px` }}
                >
                    {avatarName}
                </div>
            ) : (
                <LuUserCircle2 size={Math.min(width, height)} />
            )}
            
            {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
        </div>
    );
}

export default React.memo(Avatar);