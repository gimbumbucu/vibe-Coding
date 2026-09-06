'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Clock, Coffee, ShoppingBag, CheckCircle2, Menu as MenuIcon } from 'lucide-react'
import Link from 'next/link'

export function AdminOrderBoard({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('admin_orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            supabase
              .from('orders')
              .select('*, order_items(*, order_item_options(*))')
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setOrders(prev => [data, ...prev])
                  toast.success(`새 주문이 들어왔습니다! (#${data.order_number})`, {
                    duration: 5000,
                    style: { background: '#2563eb', color: 'white', border: 'none' }
                  })
                }
              })
          } else if (payload.eventType === 'UPDATE') {
            setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) {
      toast.error('상태 변경 실패')
    } else {
      toast.success('상태가 변경되었습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-10">
      <header className="bg-card text-card-foreground border-b border-border px-4 py-4 sticky top-0 z-10 shadow-xs flex justify-between items-center">
        <h1 className="text-xl font-bold text-foreground">주문 현황판</h1>
        <Link href="/admin/menu">
          <button className="p-2 hover:bg-secondary rounded-full transition-colors flex items-center gap-2 text-sm font-medium text-foreground">
            <MenuIcon className="w-5 h-5" /> 메뉴 관리
          </button>
        </Link>
      </header>
      
      <main className="p-4 space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-card text-card-foreground border border-border rounded-2xl shadow-xs p-5 transition-all">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
              <div>
                <span className="text-3xl font-black text-primary">#{order.order_number}</span>
                <span className="text-muted-foreground text-sm ml-3 font-medium">
                  {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-xs ${
                order.status === 'PENDING' ? 'bg-destructive text-destructive-foreground' :
                order.status === 'ACCEPTED' ? 'bg-amber-500 text-white' :
                order.status === 'COMPLETED' ? 'bg-primary text-primary-foreground' :
                'bg-secondary text-secondary-foreground'
              }`}>
                {order.status === 'PENDING' ? '접수 대기' :
                 order.status === 'ACCEPTED' ? '제조 중' :
                 order.status === 'COMPLETED' ? '제조 완료' :
                 order.status === 'PICKED_UP' ? '수령 완료' : '취소됨'}
              </span>
            </div>

            <div className="space-y-4 mb-5">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="bg-muted/50 p-3 rounded-xl border border-border">
                  <p className="font-bold text-lg text-foreground">{item.menu_name} <span className="text-primary ml-1 text-xl font-black">x{item.quantity}</span></p>
                  {item.order_item_options?.length > 0 && (
                    <div className="text-muted-foreground text-sm ml-2 mt-2 space-y-1">
                      {item.order_item_options.map((opt: any) => (
                        <p key={opt.id} className="flex items-start">
                          <span className="text-muted-foreground/60 mr-1.5">└</span> 
                          {opt.name} {opt.quantity > 1 ? <strong className="ml-1 text-foreground">({opt.quantity})</strong> : ''}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {order.status !== 'PICKED_UP' && order.status !== 'CANCELLED' && (
              <div className="grid grid-cols-2 gap-3 mt-5">
                {order.status === 'PENDING' && (
                  <>
                    <button onClick={() => updateStatus(order.id, 'ACCEPTED')} className="bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs">
                      <Coffee className="w-5 h-5" /> 주문 수락
                    </button>
                    <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 py-4 rounded-xl font-bold text-lg active:scale-95 transition-all">
                      취소
                    </button>
                  </>
                )}
                {order.status === 'ACCEPTED' && (
                  <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="col-span-2 bg-primary text-primary-foreground hover:bg-primary/90 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs">
                    <ShoppingBag className="w-5 h-5" /> 제조 완료
                  </button>
                )}
                {order.status === 'COMPLETED' && (
                  <button onClick={() => updateStatus(order.id, 'PICKED_UP')} className="col-span-2 bg-emerald-600 text-white hover:bg-emerald-700 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs">
                    <CheckCircle2 className="w-5 h-5" /> 픽업 완료
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  )
}
