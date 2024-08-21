import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useAuth } from './utils/UserContext';

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const {user, userlogin, userlogout} = useAuth();

  const handleLogin = async () => {
    const email = (document.getElementById("email")).value;
    const password = (document.getElementById("password")).value;
    try{
        const result = await axios.post('http://localhost:8080/auth/login',
            {
                email: email,
                password: password
            }
        );
        const decodedToken = jwtDecode(result.data.accessToken);
        const refreshToken = jwtDecode(result.data.refreshToken);
        userlogin({...result.data, issued: decodedToken.iat, expire: decodedToken.exp})
        navigate('/dashboard');
    } catch (error) {
        console.log(error);
    }
}

const handleSignup = async () => {
    const email = (document.getElementById("email")).value;
    const password = (document.getElementById("password")).value;
    const confirm = (document.getElementById("confirm")).value;
    
    if (password !== confirm) {
        console.log("Passwords do not match");
    } else {
        try {
            const response = await axios.post('http://localhost:8080/auth/signup',{
                email: email,
                password: password
            });
            console.log(response)
            const decodedToken = jwtDecode(result.data.accessToken);
            const refreshToken = jwtDecode(result.data.refreshToken);
            userlogin({...response.data, issued: decodedToken.iat, expire: decodedToken.exp})
            navigate('/dashboard');
        } catch (error) {
            console.log(error);
        }
    }        
}

const handleSubmit = (e) => {
  e.preventDefault();
  if (isLogin) {
      handleLogin();
  } else {
      handleSignup();
  }
}

  return (
    <>
      <div className='bg-white w-full h-screen flex flex-col items-center justify-center'>
        <div className='inset-0 w-1/3 flex flex-col items-center gap-4'>
          <img className="w-1/6" src="logo.png"></img>
          <div className='w-4/5 bg-white p-6 shadow-md flex flex-col gap-6'>
            <h1 className="text-slate-900 font-semibold text-xl ">{isLogin ? "Login" : "Sign Up"}</h1>
            <form className='flex flex-col gap-2'>
              <label className='font-semibold'>Username</label>
              <input className='bg-slate-200 border rounded-md p-1' type="email" id="email"></input>
              <label className='font-semibold'>Password</label>
              <input className='bg-slate-200 border rounded-md p-1' type="password" id="password"></input>
              {!isLogin && <>
              <label className='font-semibold'>Confirm Password</label>
              <input className='bg-slate-200 border rounded-md p-1' type="password" id="confirm"></input>
              </>}
            </form>
            <button className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700 transition duration-200" onClick={handleSubmit}>
                            {isLogin ? "Login" : "Sign Up"}
            </button>          
          </div>
          <div className="mt-4">
                        <span className="text-slate-900">
                            {isLogin ? "Don't have an account?" : "Already have an account?"} 
                        </span>
                        <button 
                            className="text-red-800 font-semibold ml-2" 
                            onClick={() => setIsLogin(!isLogin)}
                        >
                            {isLogin ? "Sign Up" : "Login"}
                        </button>
                    </div>
        </div>
        <div className='h-14 bg-slate-50'></div>
      </div>
    </>
  )
}

export default App
