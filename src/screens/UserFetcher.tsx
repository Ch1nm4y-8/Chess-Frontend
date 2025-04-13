import axios from 'axios';
import React, { useEffect, useState,ReactNode } from 'react'
import { useUser } from '../contexts/userContext';
import { ME } from '../config/endpoints';

const UserFetcher = ({children}: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true)
  const { setUser } = useUser();

  useEffect(() => {
    const isAuthenticated = async()=>{
      
        try{
          console.log('callingggggggggggggggggggg ME')
            const result = await axios.get(ME,{withCredentials:true});
            if (result.data.message.userName){
              console.log('setting user '+result.data.message.userName)
              setUser(result.data.message.userName);
            }
            else{
                setUser(null)
            }
            
        }
        catch{
          setUser(null)
        }
        finally{
          setLoading(false);
        }
    }
    isAuthenticated();
}, [])
  


  if (loading) return <div>Loading........................</div>

  return children
}

export default UserFetcher
