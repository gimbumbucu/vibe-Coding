import { createClient } from '@/lib/supabase/server'
import { OrderTracker } from './OrderTracker'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*, order_item_options(*))')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !order) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <header className="bg-white px-4 py-4 sticky top-0 z-10 border-b flex items-center justify-between">
        <Link href="/">
          <button className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">주문 현황</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </header>

      <main className="flex-1 p-4">
        <OrderTracker initialOrder={order} />
      </main>
    </div>
  )
}
