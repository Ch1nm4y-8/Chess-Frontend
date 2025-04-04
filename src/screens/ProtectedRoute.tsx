import { useEffect, useState } from 'react'
import axios from 'axios';
import { ME } from '../config/endpoints';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const [isAuth, setisAuth] = useState<boolean|null>(null);

    useEffect(() => {

        const isAuthenticated = async()=>{
            try{
                const result = await axios.get(ME,{withCredentials:true});
                if (result.data.message.userName){
                    setisAuth(true);
                }
                else{
                    setisAuth(false)
                }
                
            }
            catch(err){
                 setisAuth(false);
            }
        }
        isAuthenticated();

    }, [])

    if (isAuth==null){
        return <div>Loading..........</div>
    }
    
  return isAuth? <Outlet/> : <Navigate to="/signup" />
}

export default ProtectedRoute
