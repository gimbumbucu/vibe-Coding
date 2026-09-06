'use client'

import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { createOrderAction } from '@/app/actions/order'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, addOngoingOrderId } = useCartStore()
  const router = useRouter()
  const [isOrdering, setIsOrdering] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const totalAmount = items.reduce((acc, item) => acc + item.totalPrice, 0)

  const handleOrder = async () => {
    if (items.length === 0) return
    setIsOrdering(true)
    try {
      const orderId = await createOrderAction(items, totalAmount)
      clearCart()
      addOngoingOrderId(orderId)
      router.push(`/order/${orderId}`)
    } catch (error: any) {
      toast.error(error.message || '주문 중 오류가 발생했습니다.')
      setIsOrdering(false)
    }
  }

  if (!mounted) return null // Hydration mismatch 방지

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-28">
      <header className="bg-card px-4 py-4 sticky top-0 z-10 border-b border-border shadow-xs flex items-center gap-3">
        <Link href="/">
          <button className="p-2 -ml-2 rounded-full hover:bg-accent transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold">장바구니</h1>
      </header>

      <main className="flex-1 p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <p className="mb-6 text-lg">장바구니가 비어있습니다.</p>
            <Link href="/">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium shadow-md transition-transform active:scale-95 hover:bg-primary/90">
                메뉴 보러가기
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-card text-card-foreground p-5 rounded-2xl border border-border shadow-xs flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{item.menuName}</h3>
                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                      {item.selectedOptions.temperature && <p>• {item.selectedOptions.temperature}</p>}
                      {item.selectedOptions.size && <p>• 사이즈: {item.selectedOptions.size.name} {item.selectedOptions.size.extraPrice > 0 ? `(+${item.selectedOptions.size.extraPrice}원)` : ''}</p>}
                      {item.selectedOptions.extras?.map((ext, idx) => (
                        <p key={idx}>• {ext.name} {ext.quantity > 1 ? `(${ext.quantity}개)` : ''} (+{ext.unitPrice * ext.quantity}원)</p>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-3 pt-4 border-t border-border">
                  <span className="font-bold text-lg">{item.totalPrice.toLocaleString()}원</span>
                  <div className="flex items-center gap-4 bg-muted rounded-full p-1 border border-border">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-card shadow-xs disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-4 text-center font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-card shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-card/90 backdrop-blur-md border-t border-border shadow-lg z-20">
          <div className="flex justify-between mb-4 font-bold text-lg">
            <span>총 결제금액</span>
            <span className="text-primary">{totalAmount.toLocaleString()}원</span>
          </div>
          <button 
            disabled={isOrdering}
            onClick={handleOrder}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-md hover:bg-primary/90"
          >
            {isOrdering ? '주문 처리 중...' : `${totalAmount.toLocaleString()}원 주문하기`}
          </button>
        </div>
      )}
    </div>
  )
}
