export default function ChapterRow({ chapter, onToggle, onConfirm }) {
  const isCompleted = chapter.status === 'completed'

  const handleClick = () => {
    if (isCompleted) {
      onConfirm(chapter.id, chapter.chapter_name)
    } else {
      onToggle(chapter.id, 'completed')
    }
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 ${isCompleted ? 'bg-green-50/50' : ''}`}>
      <span className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
        {String(chapter.chapter_number).padStart(2, '0')}
      </span>
      <span className={`flex-1 text-sm min-w-0 line-clamp-3 leading-snug break-words ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
        {chapter.chapter_name}
      </span>
      <button
        onClick={handleClick}
        className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
          isCompleted
            ? 'bg-green-100 text-green-700'
            : 'bg-blue-50 text-blue-600 active:bg-blue-100'
        }`}
      >
        {isCompleted ? 'Done' : 'Mark'}
      </button>
    </div>
  )
}
