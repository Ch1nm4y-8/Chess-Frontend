import { useState } from "react"
import axios, { AxiosError } from "axios"
import Button from "../components/Button"
import Input from "../components/Input"
import { SIGNUP ,LOGIN} from "../config/endpoints"
import { useNavigate } from "react-router-dom"


const Auth = () => {
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [userName,setUserName] = useState('');
    const [error, setError] = useState<{message:string}>();
    const navigate = useNavigate();

    const signUpHandler = async ()=>{
        try{
            const result = await axios.post(SIGNUP, {
                email,
                password,
                userName,
            }, { withCredentials: true })
    
            console.log(result.data);
            navigate('/')
        }
        catch(err){
            if (err instanceof AxiosError && err.response){
                console.log('ERROR CAUGHT '+JSON.stringify(err.response.data))
                setError(err.response.data)
            }
        }
    }

    const loginHandler = async()=>{
        try{
            const result = await axios.post(LOGIN, {
                email,
                password,
            }, { withCredentials: true })
    
            console.log(result.data);
            navigate('/')
        }
        catch(err){
            if (err instanceof AxiosError && err.response){
                console.log('ERROR CAUGHT '+JSON.stringify(err.response.data))
                setError(err.response.data)
            }
        }
    }

  return (
    <>
    <div className='absolute top-0 left-0 right-0 min-h-screen  py-3 bg-center bg-cover flex justify-center items-center ' style={{ backgroundImage: "url('/assets/bg.png')" }}>
        <div className="absolute inset-0 bg-opacity-70"></div>
      

        <div className='relative w-1/3 mt-10'>
            <div role="tablist" className="tabs tabs-lifted">
            <input type="radio" name="my_tabs_2" role="tab" className="tab text-sm" aria-label="LOGIN" defaultChecked/>
            <div role="tabpanel" className="bg-black tab-content border-base-300 rounded-box p-6">
            <div className='flex justify-center'>
            <div className="card-body p-2">
                <h2 className="card-title justify-center text-3xl">Login Page</h2>
                        <Input type="text" value={email} label={'Email'} placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
                        <Input type="text" value={password} label="Password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}  />
                <div className="flex justify-center">
                        <Button onClick={loginHandler}>Login</Button>
                </div>
            </div>
        </div>     


          </div>

          <input
            type="radio"
            name="my_tabs_2"
            role="tab"
            className="tab"
            aria-label="SIGN UP"
            />
        <div role="tabpanel" className="bg-black tab-content border-base-300 rounded-box p-6">
            
            <div className='flex justify-center'>
                <div className="card-body p-2">
                    <h2 className="card-title justify-center text-3xl">Sign Up Page</h2>
        
                    <Input type="text" value={userName} label="Username" placeholder="Enter Username" onChange={(e)=>setUserName(e.target.value)}/>                      
                    <Input type="text" value={email} label="Email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
                    <Input type="text" value={password} label="Password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}  />

                    <div className="flex justify-center">
                        <Button onClick={signUpHandler}>Sign Up</Button>
                    </div>
                </div>
            </div>
        </div>
          </div>
        {error && <h1>{error.message}</h1>}
        </div>
    
    </div>






    </>
  )
}

export default Auth
