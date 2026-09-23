import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const ensureProfile = async (user) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!data) {
        await supabase
          .from('profiles')
          .upsert(
            {
              id: user.id,
              full_name:
                user.user_metadata?.full_name || user.email || user.id,
            },
            { onConflict: 'id' }
          )
      }
    } catch (err) {
      // Don't block login if profile creation fails (e.g. RLS/offline)
      console.warn('ensureProfile failed:', err?.message || err)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        // Fire-and-forget so auth state never waits on DB
        ensureProfile(session.user)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Set user synchronously — never await DB here (causes login redirect loop)
      setUser(session?.user ?? null)
      if (session?.user) {
        ensureProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (!error && data?.user) {
      // Update state immediately instead of waiting for onAuthStateChange
      setUser(data.user)
      ensureProfile(data.user)
    }
    return { data, error }
  }

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
