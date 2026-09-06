import { createClient } from '@/lib/supabase/server'
import { AdminOrderBoard } from './AdminOrderBoard'

export const revalidate = 0

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, order_item_options(*))')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <AdminOrderBoard initialOrders={orders || []} />
  )
}
