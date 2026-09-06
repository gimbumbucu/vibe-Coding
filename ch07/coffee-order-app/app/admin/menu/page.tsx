import { createClient } from '@/lib/supabase/server'
import { AdminMenuManager } from './AdminMenuManager'

export const revalidate = 0

export default async function AdminMenuPage() {
  const supabase = await createClient()

  const { data: menus } = await supabase
    .from('menus')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <AdminMenuManager initialMenus={menus || []} />
  )
}
