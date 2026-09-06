'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'

export function AdminMenuManager({ initialMenus }: { initialMenus: any[] }) {
  const [menus, setMenus] = useState(initialMenus)
  const supabase = createClient()

  const toggleSoldOut = async (id: string, currentStatus: boolean) => {
    setMenus(prev => prev.map(m => m.id === id ? { ...m, is_sold_out: !currentStatus } : m))
    
    const { error } = await supabase.from('menus').update({ is_sold_out: !currentStatus }).eq('id', id)
    
    if (error) {
      toast.error('상태 변경 실패')
      setMenus(prev => prev.map(m => m.id === id ? { ...m, is_sold_out: currentStatus } : m))
    } else {
      toast.success(!currentStatus ? '품절 처리되었습니다.' : '판매중으로 변경되었습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-10">
      <header className="bg-card text-card-foreground border-b border-border px-4 py-4 sticky top-0 z-10 shadow-xs flex items-center gap-3">
        <Link href="/admin/orders">
          <button className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-xl font-bold text-foreground">메뉴 관리</h1>
      </header>
      
      <main className="p-4 space-y-4">
        {menus.map(menu => (
          <div key={menu.id} className="bg-card text-card-foreground border border-border rounded-2xl shadow-xs p-4 flex justify-between items-center transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden shrink-0 relative border border-border">
                {menu.image_url && <img src={menu.image_url} alt={menu.name} className="w-full h-full object-cover" />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">{menu.name}</h3>
                <p className="text-muted-foreground font-medium mt-1">{menu.price.toLocaleString()}원</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className={`text-sm font-bold transition-colors ${menu.is_sold_out ? 'text-destructive' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  {menu.is_sold_out ? '품절' : '판매중'}
                </span>
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={menu.is_sold_out} onChange={() => toggleSoldOut(menu.id, menu.is_sold_out)} />
                  <div className={`block w-14 h-8 rounded-full transition-colors duration-300 shadow-inner ${menu.is_sold_out ? 'bg-destructive' : 'bg-secondary'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-background w-6 h-6 rounded-full transition-transform duration-300 shadow-xs ${menu.is_sold_out ? 'translate-x-6' : ''}`}></div>
                </div>
              </label>
              
              <button className="text-muted-foreground hover:text-primary p-2 -mr-2 rounded-lg hover:bg-accent flex items-center gap-1 text-sm font-medium transition-colors">
                <Edit className="w-4 h-4" /> 수정
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
