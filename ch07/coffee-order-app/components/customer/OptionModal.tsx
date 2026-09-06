'use client'

import { useState, useMemo } from 'react'
import { Menu } from './MenuCard'
import { OptionGroupType, OptionItemType } from './MenuBoard'
import { useCartStore, CartItemOption } from '@/store/cartStore'
import { X, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface OptionModalProps {
  menu: Menu
  optionGroups: OptionGroupType[]
  onClose: () => void
}

export function OptionModal({ menu, optionGroups, onClose }: OptionModalProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)
  
  const [selectedSingles, setSelectedSingles] = useState<Record<string, OptionItemType>>(() => {
    const defaults: Record<string, OptionItemType> = {}
    optionGroups.filter(g => !g.is_multiple && g.is_required).forEach(g => {
      if (g.option_items.length > 0) {
        defaults[g.id] = g.option_items[0]
      }
    })
    return defaults
  })

  const [selectedMultiples, setSelectedMultiples] = useState<Record<string, number>>({})

  const handleSingleSelect = (groupId: string, item: OptionItemType) => {
    setSelectedSingles(prev => ({ ...prev, [groupId]: item }))
  }

  const handleMultipleChange = (itemId: string, delta: number) => {
    setSelectedMultiples(prev => {
      const current = prev[itemId] || 0
      const next = Math.max(0, current + delta)
      return { ...prev, [itemId]: next }
    })
  }

  const extraPrice = useMemo(() => {
    let total = 0
    Object.values(selectedSingles).forEach(item => {
      total += item.extra_price
    })
    Object.entries(selectedMultiples).forEach(([itemId, qty]) => {
      for (const group of optionGroups) {
        const item = group.option_items.find(i => i.id === itemId)
        if (item) {
          total += item.extra_price * qty
          break
        }
      }
    })
    return total
  }, [selectedSingles, selectedMultiples, optionGroups])

  const calculatedUnitPrice = menu.price + extraPrice
  const totalPrice = calculatedUnitPrice * quantity

  const handleAddToCart = () => {
    for (const group of optionGroups) {
      if (group.is_required && !group.is_multiple) {
        if (!selectedSingles[group.id]) {
          toast.error(`${group.name} 옵션을 선택해주세요.`)
          return
        }
      }
    }

    const extras: CartItemOption[] = []
    
    optionGroups.filter(g => !g.is_multiple && !g.is_required).forEach(group => {
      const selected = selectedSingles[group.id]
      if (selected) {
        extras.push({
          optionId: selected.id,
          name: `${group.name}: ${selected.name}`,
          quantity: 1,
          unitPrice: selected.extra_price
        })
      }
    })

    Object.entries(selectedMultiples).forEach(([itemId, qty]) => {
      if (qty > 0) {
        for (const group of optionGroups) {
          const item = group.option_items.find(i => i.id === itemId)
          if (item) {
            extras.push({
              optionId: item.id,
              name: `${group.name}: ${item.name}`,
              quantity: qty,
              unitPrice: item.extra_price
            })
            break
          }
        }
      }
    })

    let temperature = undefined
    let size = undefined

    optionGroups.filter(g => !g.is_multiple && g.is_required).forEach(group => {
      const selected = selectedSingles[group.id]
      if (selected) {
        if (group.name.includes('온도')) temperature = selected.name
        else if (group.name.includes('사이즈')) size = { name: selected.name, extraPrice: selected.extra_price }
        else {
          extras.push({
            optionId: selected.id,
            name: `${group.name}: ${selected.name}`,
            quantity: 1,
            unitPrice: selected.extra_price
          })
        }
      }
    })

    addItem({
      menuId: menu.id,
      menuName: menu.name,
      quantity,
      selectedOptions: {
        temperature,
        size,
        extras
      },
      calculatedUnitPrice,
      totalPrice
    })
    toast.success('장바구니에 담았습니다.')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="bg-card text-card-foreground w-full sm:w-[480px] max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:fade-in-0 duration-300 shadow-xl border border-border">
        
        <div className="relative shrink-0 border-b border-border">
          {menu.image_url ? (
             <div className="w-full h-48 relative bg-muted">
               <Image src={menu.image_url} alt={menu.name} fill className="object-cover" sizes="(max-width: 480px) 100vw, 480px" />
               <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition-colors">
                 <X className="w-5 h-5" />
               </button>
             </div>
          ) : (
            <div className="absolute top-4 right-4 z-10">
               <button onClick={onClose} className="bg-muted hover:bg-muted/80 p-2 rounded-full text-muted-foreground transition-colors">
                 <X className="w-5 h-5" />
               </button>
            </div>
          )}
          <div className="p-5 bg-card">
            <h2 className="text-2xl font-bold text-foreground">{menu.name}</h2>
            <p className="text-muted-foreground mt-1">{menu.price.toLocaleString()}원</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-background space-y-6">
          {optionGroups.map(group => (
            <div key={group.id} className="bg-card text-card-foreground p-4 rounded-xl border border-border shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg">{group.name}</h3>
                {group.is_required && <span className="text-xs bg-primary/15 text-primary px-2.5 py-0.5 rounded-full font-semibold">필수</span>}
              </div>

              {!group.is_multiple ? (
                <div className="grid grid-cols-2 gap-2">
                  {group.option_items.map(item => {
                    const isSelected = selectedSingles[group.id]?.id === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSingleSelect(group.id, item)}
                        className={`flex flex-col items-center justify-center py-3 border rounded-xl transition-all ${isSelected ? 'border-primary bg-primary text-primary-foreground shadow-xs font-semibold' : 'border-border bg-card hover:bg-accent text-foreground'}`}
                      >
                        <span className="font-medium">{item.name}</span>
                        {item.extra_price > 0 && (
                          <span className={`text-sm mt-0.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>+{item.extra_price.toLocaleString()}원</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {group.option_items.map(item => {
                    const qty = selectedMultiples[item.id] || 0
                    return (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div>
                          <span className="font-medium text-foreground">{item.name}</span>
                          {item.extra_price > 0 && <span className="text-muted-foreground text-sm ml-2">(+{item.extra_price.toLocaleString()}원)</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <button disabled={qty === 0} onClick={() => handleMultipleChange(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-full border border-border bg-card hover:bg-accent disabled:opacity-30 transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-4 text-center font-semibold">{qty}</span>
                          <button onClick={() => handleMultipleChange(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-full border border-border bg-card hover:bg-accent transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
          
          <div className="bg-card text-card-foreground p-4 rounded-xl border border-border shadow-xs flex items-center justify-between">
            <span className="font-semibold text-lg">수량</span>
            <div className="flex items-center gap-4">
              <button disabled={quantity <= 1} onClick={() => setQuantity(prev => prev - 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card hover:bg-accent disabled:opacity-30 transition-colors">
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-6 text-center font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity(prev => prev + 1)} className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card hover:bg-accent transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border-t border-border shrink-0">
          <button onClick={handleAddToCart} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-md hover:bg-primary/90">
            <span>{totalPrice.toLocaleString()}원</span>
            <span className="opacity-80 font-normal ml-1">담기</span>
          </button>
        </div>

      </div>
    </div>
  )
}
