import { useState } from "react"

export function useReviewSoA({
  defaultControlState = "no",
  defaultViewMode = "pengisian",
  defaultSection = "",
  defaultQuestion = "",
} = {}) {
  const [controlState, setControlState] = useState(defaultControlState)
  const [comment, setComment] = useState("")
  const [toolbarShow, setToolbarShow] = useState(true)
  const [viewMode, setViewMode] = useState(defaultViewMode)
  const [activeSection, setActiveSection] = useState(defaultSection)
  const [activeQuestion, setActiveQuestion] = useState(defaultQuestion)

  return {
    controlState,
    setControlState,
    comment,
    setComment,
    toolbarShow,
    setToolbarShow,
    viewMode,
    setViewMode,
    activeSection,
    setActiveSection,
    activeQuestion,
    setActiveQuestion,
  }
}
