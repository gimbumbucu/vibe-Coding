'use client';

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Markdown } from 'tiptap-markdown'
import { SlashCommand } from './SlashCommand'
import { useNoteStore } from '../store/useNoteStore'
import { useEffect, useRef, useState, useMemo } from 'react'
import debounce from 'lodash/debounce'
import { writeTextFile } from '@tauri-apps/plugin-fs'

export default function NotionEditor() {
  const { notes, activeNoteId, workspacePath } = useNoteStore()
  
  const prevNoteId = useRef<string | null>(null)
  const isUpdatingFromStore = useRef(false)
  const [mounted, setMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 디바운스된 실제 파일 저장 함수
  const debouncedSave = useMemo(
    () => debounce(async (id: string, markdown: string, title: string) => {
      setIsSaving(true)
      try {
        await writeTextFile(id, markdown)
        useNoteStore.getState().updateNoteState(id, markdown, title)
      } catch (error) {
        console.error('Failed to write file', error)
      } finally {
        setIsSaving(false)
      }
    }, 1000),
    []
  )

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown.configure({
        transformPastedText: true,
        transformCopiedText: false,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      SlashCommand,
      Placeholder.configure({
        placeholder: "명령어를 사용하려면 '/'를 입력하세요...",
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const currentActiveId = useNoteStore.getState().activeNoteId
      if (isUpdatingFromStore.current || !currentActiveId) return;

      const markdown = editor.storage.markdown.getMarkdown()
      
      let docTitle = '제목 없음'
      const textContent = editor.getText()
      const lines = textContent.split('\\n').map(l => l.trim()).filter(l => l.length > 0)
      if (lines.length > 0) {
        docTitle = lines[0].substring(0, 50)
      }
      
      debouncedSave(currentActiveId, markdown, docTitle)
    },
  })

  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  // activeNoteId가 변경되면 에디터 콘텐츠 교체
  useEffect(() => {
    if (editor && activeNoteId && activeNoteId !== prevNoteId.current) {
      prevNoteId.current = activeNoteId
      const currentNote = useNoteStore.getState().notes.find(n => n.id === activeNoteId)
      if (currentNote) {
        isUpdatingFromStore.current = true
        editor.commands.setContent(currentNote.content, { emitUpdate: false })
        setTimeout(() => {
          isUpdatingFromStore.current = false
        }, 0)
      }
    }
  }, [activeNoteId, editor])

  if (!mounted) return null

  if (!workspacePath) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full bg-white">
        왼쪽 사이드바에서 폴더를 열어주세요.
      </div>
    )
  }

  if (!activeNoteId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full bg-white">
        <svg className="w-12 h-12 text-gray-200 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        문서를 선택하거나 새 노트를 작성하세요.
      </div>
    )
  }

  return (
    <div className="w-full max-w-[900px] mx-auto px-12 sm:px-24 py-16 md:py-24">
      <div className="text-xs text-gray-400 mb-8 flex justify-end h-4">
        {isSaving ? '저장 중...' : '자동 저장됨'}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
