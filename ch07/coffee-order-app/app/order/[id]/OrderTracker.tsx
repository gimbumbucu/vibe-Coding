'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cartStore'
import { CheckCircle2, Clock, Coffee, ShoppingBag, X } from 'lucide-react'

export function OrderTracker({ initialOrder }: { initialOrder: any }) {
  const [order, setOrder] = useState(initialOrder)
  const supabase = createClient()
  const { removeOngoingOrderId } = useCartStore()

  useEffect(() => {
    if (order.status === 'PICKED_UP' || order.status === 'CANCELLED') {
      removeOngoingOrderId(order.id)
    }
  }, [order.status, order.id, removeOngoingOrderId])

  useEffect(() => {
    const channel = supabase
      .channel(`order_status_${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`
        },
        (payload) => {
          setOrder((prev: any) => ({ ...prev, status: payload.new.status }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [order.id, supabase])

  const statusSteps = [
    { id: 'PENDING', label: '접수 대기', icon: Clock },
    { id: 'ACCEPTED', label: '제조 중', icon: Coffee },
    { id: 'COMPLETED', label: '제조 완료', icon: ShoppingBag },
    { id: 'PICKED_UP', label: '수령 완료', icon: CheckCircle2 },
  ]

  const currentStepIndex = statusSteps.findIndex(s => s.id === order.status)
  
  if (order.status === 'CANCELLED') {
    return (
      <div className="bg-white p-8 rounded-2xl border text-center shadow-sm mt-8 mx-4">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">주문 취소됨</h2>
        <p className="text-gray-500">관리자에 의해 주문이 취소되었습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border shadow-sm text-center">
        <p className="text-gray-500 text-sm mb-1">주문번호</p>
        <h2 className="text-4xl font-black text-blue-600 mb-8">#{order.order_number}</h2>
        
        <div className="relative flex justify-between items-center max-w-sm mx-auto px-4">
          <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 z-0 rounded-full"></div>
          <div 
            className="absolute top-5 left-8 h-1 bg-blue-500 z-0 transition-all duration-700 ease-in-out rounded-full"
            style={{ width: `calc(${Math.max(0, currentStepIndex) / (statusSteps.length - 1) * 100}% - 2rem)` }}
          ></div>
          
          {statusSteps.map((step, index) => {
            const isCompleted = currentStepIndex >= index
            const isCurrent = currentStepIndex === index
            const Icon = step.icon
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${isCompleted ? 'bg-blue-500 text-white scale-110' : 'bg-white border-2 border-gray-200 text-gray-300'} ${isCurrent ? 'ring-4 ring-blue-100 shadow-md' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold transition-colors duration-500 ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" /> 주문 내역
        </h3>
        <div className="space-y-4">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
              <div>
                <p className="font-semibold text-gray-900">{item.menu_name} <span className="text-gray-500 ml-1 text-sm">x{item.quantity}</span></p>
                <div className="text-sm text-gray-500 mt-1.5 space-y-1">
                  {item.order_item_options?.map((opt: any) => (
                    <p key={opt.id} className="flex items-start">
                      <span className="text-gray-300 mr-1.5">└</span> 
                      {opt.name} {opt.quantity > 1 ? `(${opt.quantity})` : ''}
                    </p>
                  ))}
                </div>
              </div>
              <p className="font-semibold text-gray-900">{(item.unit_price * item.quantity).toLocaleString()}원</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-6 pt-5 border-t border-gray-200 font-bold text-xl">
          <span>총 결제금액</span>
          <span className="text-blue-600">{order.total_price.toLocaleString()}원</span>
        </div>
      </div>
    </div>
  )
}
