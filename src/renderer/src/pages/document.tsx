import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Document as IPCDocument } from '@/shared/types/ipc'
import { Editor, OnContentUpdatedParams } from '../components/Editor'
import { ToC } from '../components/ToC'

export function Document() {
  const editorSectionRef = useRef<HTMLDivElement | null>(null)
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data, isFetching } = useQuery(['document', id], async () => {
    const response = await window.api.fetchDocument({ id: id! })
    return response.data
  })

  const { mutateAsync: saveDocument } = useMutation(
    async ({ title, content }: OnContentUpdatedParams) => {
      await window.api.saveDocument({ id: id!, title, content })
    },
    {
      onSuccess: (_, { title }) => {
        queryClient.setQueryData<IPCDocument[]>(['documents'], (documents) => {
          return documents?.map((doc) => {
            if (doc.id === id) {
              return { ...doc, title }
            }
            return doc
          })
        })
      },
    },
  )

  const initialContent = useMemo(() => {
    if (data) {
      return `<h1>${data.title}</h1>${data.content ?? '<p></p>'}`
    }
    return ''
  }, [data])

  function handleEditorContentUpdated({
    title,
    content,
  }: OnContentUpdatedParams) {
    saveDocument({ title, content })
  }

  useEffect(() => {
    function scrollToTop() {
      const editorElement = document.querySelector('.editor-content')
      if (!editorElement) return
      setTimeout(() => {
        if (!editorSectionRef.current) return
        console.log(editorSectionRef.current)
        console.log(editorSectionRef.current.scrollTop, 'initial')
        editorSectionRef.current.scrollTo(0, 0)
        console.log(editorSectionRef.current.scrollTop, 'finished')
      }, 100)
    }
    scrollToTop()
  }, [initialContent])

  return (
    <main className="flex-1 flex py-12 px-10 pr-5 gap-8">
      <aside className="hidden lg:block sticky top-0">
        <span className="text-rotion-300 font-semibold text-xs">
          TABLE OF CONTENT
        </span>
        <ToC.Root>
          <ToC.Link>Back-end</ToC.Link>
        </ToC.Root>
      </aside>

      <section
        ref={editorSectionRef}
        className="editor-content flex-1 flex flex-col items-center overflow-y-scroll overflow-x-hidden max-h-[75vh]"
      >
        {!isFetching && data && (
          <Editor
            onContentUpdated={handleEditorContentUpdated}
            content={initialContent}
          />
        )}
      </section>
    </main>
  )
}
