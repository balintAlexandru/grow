import type { ComponentType } from 'react'
import { Route, Routes } from 'react-router-dom'
import { sections, type Section } from './config/sections'
import EventsPage from './features/events/EventsPage'
import LearningPage from './features/learning/LearningPage'
import AppLayout from './layouts/AppLayout'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import SectionPage from './pages/SectionPage'

/** Sections with their own page; every other section uses the generic `SectionPage`. */
const customPages: Record<string, ComponentType<{ section: Section }>> = {
  events: EventsPage,
  learning: LearningPage,
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        {sections.map((section) => {
          const Page = customPages[section.id] ?? SectionPage
          return <Route key={section.id} path={section.path} element={<Page section={section} />} />
        })}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
