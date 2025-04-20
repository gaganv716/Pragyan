import React from 'react'
import { ChatState } from '../Context/chatProvider'
import SingleChat from './SingleChat'
import "./ChatBox.css"

const ChatBox = ({fetchAgain,setFetchAgain}) => {
  const {selectedChat } = ChatState()
  return (
    <>
    <div className={`chat-box ${selectedChat ? "show" : "hide"}`}>
  {/* chat content here */}
    <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
</div>

    </>
  )
}

export default ChatBox