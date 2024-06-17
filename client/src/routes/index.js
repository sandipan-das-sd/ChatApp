import {createBrowserRouter} from "react-router-dom"
import App from "../App"

import CheckemailPage from "../pages/CheckemailPage"
import Checkpasswordpage from "../pages/Checkpasswordpage"
import Home from "../pages/Home"
import MessagePage from "../component/MessagePage"
import RegisterPage from "../pages/RegisterPage"
import AuthLayouts from "../layout"
import Forgotpassword from "../pages/Forgotpassword"
import CallContainer from "../component/CallContainer"
const router=createBrowserRouter([
    {
        path:'/',
        element:<App/>,
        children:[
            {
                path:"register",
                element: <AuthLayouts>
                    <RegisterPage/>
                </AuthLayouts>
            },
            {
                path:"email",
                element:
                <AuthLayouts>
                
                <CheckemailPage/>
                </AuthLayouts>
            },
            {
                path:"password",
                
                element:
                <AuthLayouts>
                <Checkpasswordpage/>
                </AuthLayouts>
            },
            {
                path:"forgot-password",
                element:
                <AuthLayouts>
                    <Forgotpassword/>
                </AuthLayouts>
            },
            {
               path:"call",
               element:
               <AuthLayouts>
                <CallContainer/>
               </AuthLayouts>

            },
            {
                path:"",
                element:
                
                <Home/>,
                children:[
                    {
                        path:":userId",
                        element:<MessagePage/>
                    }
                ]
            }
        ]
    }
])
export default router