'use client'

import { useState, useMemo } from 'react'
import { Menu, MenuCard } from './MenuCard'
import { OptionModal } from './OptionModal'
import { useCartStore } from '@/store/cartStore'
import { ShoppingCart, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface OptionItemType {
  id: string
  name: string
  extra_price: number
}

export interface OptionGroupType {
  id: string
  name: string
  is_required: boolean
  is_multiple: boolean
  option_items: OptionItemType[]
}

interface MenuBoardProps {
  menus: Menu[]
  menuOptionsMap: Record<string, OptionGroupType[]>
}

export function MenuBoard({ menus, menuOptionsMap }: MenuBoardProps) {
  const [activeCategory, setActiveCategory] = useState<string>('전체')
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const cartItems = useCartStore((state) => state.items)
  const ongoingOrderIds = useCartStore((state) => state.ongoingOrderIds)
  const router = useRouter()

  const categories = useMemo(() => {
    const cats = new Set(menus.map((m) => m.category))
    return ['전체', ...Array.from(cats)]
  }, [menus])

  const filteredMenus = useMemo(() => {
    if (activeCategory === '전체') return menus
    return menus.filter((m) => m.category === activeCategory)
  }, [menus, activeCategory])

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Ongoing Order Banners */}
      {ongoingOrderIds.length > 0 && (
        <div className="sticky top-0 z-20">
          {ongoingOrderIds.map((orderId, index) => (
            <div
              key={orderId}
              onClick={() => router.push(`/order/${orderId}`)}
              className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between cursor-pointer border-b border-primary/20 shadow-xs"
            >
              <span className="font-medium text-sm">
                진행 중인 주문 {ongoingOrderIds.length > 1 ? `(${index + 1}/${ongoingOrderIds.length})` : ''} 상태 보기
              </span>
              <ChevronRight className="w-5 h-5" />
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <header className="bg-card px-4 py-4 sticky top-0 z-10 border-b border-border shadow-xs">
        <h1 className="text-xl font-bold text-foreground">스마트 주문</h1>
        
        {/* Categories */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Menu Grid */}
      <main className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMenus.map((menu) => (
            <MenuCard 
              key={menu.id} 
              menu={menu} 
              onClick={(m) => setSelectedMenu(m)} 
            />
          ))}
        </div>
      </main>

      {/* Option Modal */}
      {selectedMenu && (
        <OptionModal
          menu={selectedMenu}
          optionGroups={menuOptionsMap[selectedMenu.id] || []}
          onClose={() => setSelectedMenu(null)}
        />
      )}

      {/* Cart Floating Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur-md border-t border-border shadow-lg">
          <Link href="/cart">
            <button className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-primary/90 transition-all active:scale-[0.99]">
              <ShoppingCart className="w-5 h-5" />
              <span>장바구니 보기</span>
              <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-full text-sm ml-2">
                {cartItems.length}
              </span>
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
