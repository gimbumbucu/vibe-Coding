import NotionEditor from '@/components/NotionEditor'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  return (
    <main className="flex h-screen w-full bg-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto relative bg-white">
        <NotionEditor />
      </div>
    </main>
  )
}
