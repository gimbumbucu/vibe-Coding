'use client'

import { useState } from 'react'
import { loginAction } from '@/app/actions/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Coffee } from 'lucide-react'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)
    
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success('로그인 성공')
      router.push('/admin/orders')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-card text-card-foreground p-8 rounded-2xl shadow-sm border border-border w-full max-w-sm">
        <div className="flex justify-center mb-6 text-primary">
          <Coffee className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">관리자 로그인</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">이메일</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/60"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">비밀번호</label>
            <input 
              type="password" 
              name="password" 
              required 
              className="w-full px-4 py-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/60"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-bold mt-8 hover:bg-primary/90 disabled:opacity-70 active:scale-95 transition-all shadow-xs"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}
