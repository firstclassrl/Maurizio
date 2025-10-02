import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { populateDemoData, clearDemoData } from '../lib/demo-data'

export function useDemoData(user: User | null) {
  const [isPopulating, setIsPopulating] = useState(false)
  const [hasDemoData, setHasDemoData] = useState(false)

  const isDemoUser = user?.email?.includes('demo1@abruzzo.ai') || 
                     user?.email?.includes('demo2@abruzzo.ai') || 
                     user?.email?.includes('demo3@abruzzo.ai')

  useEffect(() => {
    if (user && isDemoUser) {
      checkAndPopulateDemoData()
    }
  }, [user, isDemoUser])

  const checkAndPopulateDemoData = async () => {
    if (!user || !isDemoUser) return

    try {
      setIsPopulating(true)
      
      // Check if user already has data
      const { data: existingClients, error } = await import('../lib/supabase').then(
        ({ supabase }) => supabase
          .from('clients')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
      )

      if (error) {
        console.error('Error checking existing data:', error)
        return
      }

      // If no data exists, populate demo data
      if (!existingClients || existingClients.length === 0) {
        const success = await populateDemoData(user.id, user.email!)
        if (success) {
          setHasDemoData(true)
          console.log('Demo data populated successfully')
        }
      } else {
        setHasDemoData(true)
        console.log('Demo data already exists')
      }
    } catch (error) {
      console.error('Error in checkAndPopulateDemoData:', error)
    } finally {
      setIsPopulating(false)
    }
  }

  const repopulateDemoData = async () => {
    if (!user || !isDemoUser) return false

    try {
      setIsPopulating(true)
      const success = await populateDemoData(user.id, user.email!)
      if (success) {
        setHasDemoData(true)
        return true
      }
      return false
    } catch (error) {
      console.error('Error repopulating demo data:', error)
      return false
    } finally {
      setIsPopulating(false)
    }
  }

  const clearUserDemoData = async () => {
    if (!user || !isDemoUser) return false

    try {
      setIsPopulating(true)
      const success = await clearDemoData(user.id)
      if (success) {
        setHasDemoData(false)
        return true
      }
      return false
    } catch (error) {
      console.error('Error clearing demo data:', error)
      return false
    } finally {
      setIsPopulating(false)
    }
  }

  return {
    isDemoUser,
    isPopulating,
    hasDemoData,
    repopulateDemoData,
    clearUserDemoData
  }
}
