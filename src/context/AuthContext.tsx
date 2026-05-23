import React, { createContext, useState, useContext, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js'
import type {User} from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const ANONKEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(URL, ANONKEY)

interface AuthContextType {
  user: User | null;
  token: string | null,
  loading: boolean;
  login: (email: string) => Promise<any>;
  logout: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>("")
    const [loading, setLoading] = useState(true);



    const login = async ( email: string )=>{
        setLoading(true);

        const { data, error } = await supabase.auth.signInWithOtp({
            email: email,
            options: {
                // set this to false if you do not want the user to be automatically signed up
                shouldCreateUser: true,
            },
        })

        if(error){
            throw new Error("There was an error loggin in, please try again later")
        }
        
        return data
    }

    const logout = async ()=>{
        const { error } = await supabase.auth.signOut()
        if(error){
            throw new Error("Error loggin")
        }
        setUser(null)
        localStorage.removeItem("token")
    }

    const verifyOtp = async (email: string, otp: string)=>{
        const {
        data: { session },
        error,
        } = await supabase.auth.verifyOtp({
            email: email,
            token: otp,
            type: 'email',
        })

        if (error){
            throw new Error("Error verifying OTP, please check and try again")
        }
        setToken(session!.access_token)
        return session
    }

     // Check for existing user in localStorage on initial load (optional)
    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            const token = session?.access_token ?? null;
            setToken(token);
            setLoading(false);
        });

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setToken(session?.access_token ?? null);
            setLoading(false);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const value = {
        user,
        loading,
        login,
        logout,
        verifyOtp,
        token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );


}
