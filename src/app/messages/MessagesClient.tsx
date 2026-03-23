'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Conversation, Message } from '@/types'
import { Send, Loader2, MessageCircle, ChevronLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function MessagesClient({ user, initialConversations }: { user: User, initialConversations: Conversation[] }) {
  const [conversations, _setConversations] = useState<Conversation[]>(initialConversations)
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!activeConv) return
    fetchMessages(activeConv.id)

    const channel = supabase
      .channel(`conv:${activeConv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConv.id}`,
      }, (payload) => {
        setMessages(m => [...m, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeConv?.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages(convId: string) {
    setLoadingMessages(true)
    const { data } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(*)')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setLoadingMessages(false)
  }

  const selectConversation = (conv: Conversation) => {
    setActiveConv(conv)
    setMobileView('chat')
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConv || sending) return
    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')
    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content,
    })
    setSending(false)
  }

  const getOtherUser = (conv: Conversation) => {
    return user.user_type === 'brand' ? (conv as any).bar : (conv as any).brand
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Conversation List */}
      <div className={cn('w-full md:w-80 border-r border-[#1a1a1a] flex flex-col', mobileView === 'chat' ? 'hidden md:flex' : 'flex')}>
        <div className="p-4 border-b border-[#1a1a1a]">
          <h2 className="font-semibold text-lg">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => {
              const other = getOtherUser(conv)
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={cn('w-full text-left p-4 border-b border-[#1a1a1a] hover:bg-[#111111] transition-colors', activeConv?.id === conv.id ? 'bg-[#111111]' : '')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold flex-shrink-0">
                      {other?.business_name?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{other?.business_name}</div>
                      <div className="text-gray-500 text-xs truncate">{other?.city}, {other?.state}</div>
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={cn('flex-1 flex flex-col', mobileView === 'list' ? 'hidden md:flex' : 'flex')}>
        {activeConv ? (
          <>
            <div className="p-4 border-b border-[#1a1a1a] flex items-center gap-3">
              <button onClick={() => setMobileView('list')} className="md:hidden text-gray-400 hover:text-white">
                <ChevronLeft size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold">
                {getOtherUser(activeConv)?.business_name?.[0]}
              </div>
              <div>
                <div className="font-medium">{getOtherUser(activeConv)?.business_name}</div>
                <div className="text-gray-500 text-xs">{getOtherUser(activeConv)?.city}, {getOtherUser(activeConv)?.state}</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-[#D4AF37]" /></div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === user.id
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={cn('max-w-xs md:max-w-md rounded-2xl px-4 py-2 text-sm', isMe ? 'bg-[#D4AF37] text-black rounded-br-sm' : 'bg-[#1a1a1a] text-white rounded-bl-sm')}>
                        <p>{msg.content}</p>
                        <p className={cn('text-xs mt-1', isMe ? 'text-black/60' : 'text-gray-500')}>{formatDate(msg.created_at)}</p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-[#1a1a1a]">
              <div className="flex gap-3">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message..."
                  className="input-dark flex-1"
                />
                <button onClick={sendMessage} disabled={!newMessage.trim() || sending} className="btn-gold px-4 disabled:opacity-50">
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={64} className="text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400">Select a conversation</h3>
              <p className="text-gray-600 text-sm mt-2">Choose a conversation from the left to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
