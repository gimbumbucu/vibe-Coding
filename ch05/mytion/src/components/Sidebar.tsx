'use client'

import { useNoteStore } from '../store/useNoteStore'
import { useEffect, useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { readDir, readTextFile, writeTextFile, remove } from '@tauri-apps/plugin-fs'
import { join } from '@tauri-apps/api/path'

export default function Sidebar() {
  const { notes, activeNoteId, workspacePath, setWorkspacePath, setNotes, addNoteToState, setActiveNote, deleteNoteFromState } = useNoteStore()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const loadWorkspace = async (path: string) => {
    setIsLoading(true)
    try {
      const entries = await readDir(path)
      const loadedNotes = []
      for (const entry of entries) {
        if (entry.isFile && entry.name.endsWith('.md')) {
          const fullPath = await join(path, entry.name)
          const content = await readTextFile(fullPath)
          const title = entry.name.replace('.md', '')
          loadedNotes.push({ id: fullPath, title, content, updatedAt: Date.now() })
        }
      }
      setNotes(loadedNotes.sort((a, b) => b.updatedAt - a.updatedAt))
    } catch (error) {
      console.error('Failed to load workspace', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenFolder = async () => {
    try {
      const selected = await open({ directory: true, multiple: false })
      if (selected && typeof selected === 'string') {
        setWorkspacePath(selected)
        await loadWorkspace(selected)
      }
    } catch (error) {
      console.error('Failed to open dialog', error)
    }
  }

  const handleNewNote = async () => {
    if (!workspacePath) {
      alert("먼저 폴더를 열어주세요.")
      return
    }
    const title = '새로운 문서'
    const content = '# 새로운 문서\\n여기에 글을 작성해보세요.'
    const filename = `${title}-${Date.now()}.md`
    const fullPath = await join(workspacePath, filename)
    try {
      await writeTextFile(fullPath, content)
      addNoteToState({ id: fullPath, title, content, updatedAt: Date.now() })
    } catch (error) {
      console.error('Failed to create file', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
      deleteNoteFromState(id)
    } catch (error) {
      console.error('Failed to delete file', error)
    }
  }

  if (!mounted) {
    return <div className="w-64 bg-[#f7f7f5] border-r border-gray-200 flex flex-col h-screen flex-shrink-0" />
  }

  return (
    <div className="w-64 bg-[#f7f7f5] border-r border-gray-200 flex flex-col h-screen flex-shrink-0">
      
      <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
        <span className="font-semibold text-[#37352f] truncate text-sm">
          {workspacePath ? workspacePath.split('\\\\').pop() : '워크스페이스 없음'}
        </span>
        <button 
          onClick={handleOpenFolder}
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700 transition-colors shrink-0"
        >
          폴더 열기
        </button>
      </div>

      <div 
        className={`px-4 py-3 mt-2 mx-2 flex items-center justify-between rounded-md transition-colors group ${workspacePath ? 'hover:bg-gray-200/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
        onClick={handleNewNote}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#eb5757] rounded text-white flex items-center justify-center font-bold text-xs shadow-sm">M</div>
          <span className="font-semibold text-[#37352f] text-sm">새 노트 쓰기</span>
        </div>
      </div>

      <div className="mt-4 px-3 mb-1 text-xs font-semibold text-gray-500">
        문서 목록 {isLoading && '(로딩 중...)'}
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {!workspacePath && (
          <div className="text-xs text-gray-400 px-3 py-2">폴더를 열어주세요.</div>
        )}
        {workspacePath && notes.length === 0 && !isLoading && (
          <div className="text-xs text-gray-400 px-3 py-2">문서가 없습니다.</div>
        )}
        {notes.map((note) => (
          <div 
            key={note.id}
            onClick={() => setActiveNote(note.id)}
            className={`group flex items-center justify-between px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${activeNoteId === note.id ? 'bg-gray-200/60 font-medium text-[#37352f]' : 'text-gray-600 hover:bg-gray-200/40'}`}
          >
            <div className="truncate flex-1 flex items-center gap-2">
              <svg className="text-gray-400 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span className="truncate">{note.title}</span>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 ml-2 p-1 rounded hover:bg-gray-300 flex-shrink-0 transition-opacity"
              title="문서 삭제"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
