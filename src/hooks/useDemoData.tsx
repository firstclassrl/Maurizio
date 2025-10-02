import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { populateDemoData, clearDemoData } from '../lib/demo-data'
import { supabase } from '../lib/supabase'

export function useDemoData(user: User | null) {
  const [isPopulating, setIsPopulating] = useState(false)
  const [hasDemoData, setHasDemoData] = useState(false)

  const isDemoUser = (() => {
    const email = (user?.email || '').trim().toLowerCase()
    const isDemo = ['demo1@abruzzo.ai', 'demo2@abruzzo.ai', 'demo3@abruzzo.ai',
            'demo1@abruzzo.it', 'demo2@abruzzo.it', 'demo3@abruzzo.it'].includes(email)
    return isDemo
  })()

  useEffect(() => {
    if (user && isDemoUser) {
      checkAndPopulateDemoData()
    }
  }, [user, isDemoUser])

  const checkAndPopulateDemoData = async () => {
    if (!user || !isDemoUser) {
      console.log('Not a demo user or no user:', { user: user?.email, isDemoUser })
      return
    }

    try {
      console.log('Starting demo data check for:', user.email)
      setIsPopulating(true)
      
      // Check if user already has data
      const [{ data: existingClients, error: clientsErr }, { data: existingActivities, error: actsErr }] = await Promise.all([
        supabase.from('clients').select('id').eq('user_id', user.id).limit(1),
        supabase.from('activities').select('id').eq('user_id', user.id).limit(1)
      ])

      if (clientsErr || actsErr) {
        console.error('Error checking existing data:', clientsErr || actsErr)
        return
      }

      console.log('Existing clients found:', existingClients?.length || 0)

      // If no data exists, populate demo data
      if ((!existingClients || existingClients.length === 0) && (!existingActivities || existingActivities.length === 0)) {
        console.log('No existing data found, populating demo data...')
        const success = await populateDemoData(user.id, user.email!)
        if (success) {
          setHasDemoData(true)
          // Reload to refresh pages and queries
          setTimeout(() => window.location.reload(), 300)
        } else {
          console.error('Failed to populate demo data')
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
    if (!user || !isDemoUser) {
      console.log('repopulateDemoData: not demo user or no user', { user: user?.email, isDemoUser })
      return false
    }

    try {
      console.log('=== REPOPULATE DEMO DATA START ===')
      console.log('repopulateDemoData: starting...', user.email, user.id)
      setIsPopulating(true)
      
      const success = await populateDemoData(user.id, user.email!)
      
      console.log('repopulateDemoData: result', success)
      if (success) {
        setHasDemoData(true)
        // Reload to refresh pages and queries
        setTimeout(() => window.location.reload(), 300)
        return true
      } else {
        console.log('repopulateDemoData: failed')
        return false
      }
    } catch (error) {
      console.error('=== REPOPULATE DEMO DATA ERROR ===')
      console.error('Error repopulating demo data:', error)
      return false
    } finally {
      console.log('repopulateDemoData: setting isPopulating to false')
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
