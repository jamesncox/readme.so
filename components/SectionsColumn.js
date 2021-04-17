import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
// import { sectionTemplates } from '../data/section-templates'

import { SortableItem } from './SortableItem'

export const SectionsColumn = ({
  selectedSectionSlugs,
  setSelectedSectionSlugs,
  sectionSlugs,
  setSectionSlugs,
  setFocusedSectionSlug,
  focusedSectionSlug,
  getTemplate,
  setTemplates,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const onAddSection = (e, section) => {
    setSectionSlugs((prev) => prev.filter((s) => s !== section))
    setSelectedSectionSlugs((prev) => [...prev, section])
    setFocusedSectionSlug(section)
  }

  const addCustomSection = () => {
    const newSection = {
      slug: `${Date.now()}`,
      name: 'Custom',
      markdown: `
  ## Custom
  
    `,
    }
    setTemplates((prev) => [...prev, newSection])
    setSelectedSectionSlugs((prev) => [...prev, newSection.slug])
    setFocusedSectionSlug(newSection.slug)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setSelectedSectionSlugs((sections) => {
        const oldIndex = sections.findIndex((s) => s === active.id)
        const newIndex = sections.findIndex((s) => s === over.id)

        return arrayMove(sections, oldIndex, newIndex)
      })
    }
  }

  const onDeleteSection = (e, sectionSlug) => {
    e.stopPropagation()
    setSelectedSectionSlugs((prev) => prev.filter((s) => s !== sectionSlug))
    setSectionSlugs((prev) => [...prev, sectionSlug])
    setFocusedSectionSlug(null)
  }

  const alphabetizedSectionSlugs = sectionSlugs.sort((a, b) => {
    const aTitle = getTemplate(a).name
    const bTitle = getTemplate(b).name
    if (aTitle < bTitle) {
      return -1
    } else {
      return 1
    }
  })

  // const alphabetizedSectionSlugs = sectionSlugs.sort()

  return (
    <div className="sections">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-3">Sections</h3>
      <div className="full-screen overflow-y-scroll px-3 pr-4">
        {selectedSectionSlugs.length > 0 && (
          <h4 className="mb-3 text-xs leading-6 text-gray-900">
            Click on a section below to edit the contents
          </h4>
        )}
        <ul className="mb-12 space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={selectedSectionSlugs} strategy={verticalListSortingStrategy}>
              {selectedSectionSlugs.map((s) => (
                <SortableItem
                  key={s}
                  id={s}
                  section={getTemplate(s)}
                  focusedSectionSlug={focusedSectionSlug}
                  setFocusedSectionSlug={setFocusedSectionSlug}
                  onDeleteSection={onDeleteSection}
                />
              ))}
            </SortableContext>
          </DndContext>
        </ul>
        {sectionSlugs.length > 0 && (
          <h4 className="mb-3 text-xs leading-6 text-gray-900">
            Click on a section below to add it to your readme
          </h4>
        )}
        <ul className="mb-12 space-y-3">
          <button
            className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 w-full h-full flex items-center py-2 pl-3 pr-6 bg-emerald-400 text-white rounded-md shadow cursor-pointer block"
            type="button"
            onClick={addCustomSection}
          >
            <span>{'Custom'}</span>
          </button>
          {alphabetizedSectionSlugs.map((s) => (
            <li key={s}>
              <button
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 w-full h-full flex items-center py-2 pl-3 pr-6 bg-white rounded-md shadow cursor-pointer block"
                type="button"
                onClick={(e) => onAddSection(e, s)}
              >
                <span>{getTemplate(s).name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
