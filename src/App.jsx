import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'manman-code-translator-cards'
const LIBRARY_KEY = 'manman-code-translator-libraries'

const now = Date.now()

const starterCards = [
  {
    id: 'starter-diff',
    type: 'term',
    title: 'diff',
    explanation: '查看两份代码之间哪里不一样，常用来确认自己改了什么。',
    stage: '提交前',
    understanding: '像给代码改动拍一张对比照。',
    tags: ['git', '检查'],
    note: '提交前看一眼 diff，能少很多低级失误。',
    createdAt: now - 7 * 60 * 1000,
  },
  {
    id: 'starter-commit',
    type: 'term',
    title: 'commit',
    explanation: '把当前代码改动保存成一次有说明的记录。',
    stage: '保存进度',
    understanding: '像游戏存档，但每次最好写清楚这次做了什么。',
    tags: ['git', '记录'],
    note: '小步提交更容易回头找问题。',
    createdAt: now - 6 * 60 * 1000,
  },
  {
    id: 'starter-push',
    type: 'term',
    title: 'push',
    explanation: '把本地提交上传到远程仓库，比如 GitHub。',
    stage: '同步代码',
    understanding: '把自己电脑里的存档发到云端。',
    tags: ['git', 'github'],
    note: 'push 前先确认 commit 已经完成。',
    createdAt: now - 5 * 60 * 1000,
  },
  {
    id: 'starter-terminal',
    type: 'term',
    title: 'terminal',
    explanation: '输入命令和电脑沟通的窗口。',
    stage: '日常开发',
    understanding: '它看起来冷冰冰，其实只是另一种按钮。',
    tags: ['工具', '命令行'],
    note: '报错信息通常也会在这里出现。',
    createdAt: now - 4 * 60 * 1000,
  },
  {
    id: 'starter-workspace',
    type: 'term',
    title: 'workspace',
    explanation: '当前项目所在的工作目录，代码文件通常都放在这里。',
    stage: '打开项目',
    understanding: '像一张专门放这个项目材料的书桌。',
    tags: ['项目', '文件'],
    note: '运行命令前要确认自己在正确的 workspace。',
    createdAt: now - 3 * 60 * 1000,
  },
  {
    id: 'starter-npm-dev',
    type: 'term',
    title: 'npm run dev',
    explanation: '启动开发服务器，用来在浏览器里实时预览项目。',
    stage: '开发预览',
    understanding: '打开一个临时小窗口，让页面边写边看。',
    tags: ['npm', 'vite', '预览'],
    note: '通常终端会显示本地访问地址。',
    createdAt: now - 2 * 60 * 1000,
  },
  {
    id: 'starter-npm-build',
    type: 'term',
    title: 'npm run build',
    explanation: '把项目打包成适合上线部署的静态文件。',
    stage: '准备上线',
    understanding: '把散装开发文件整理成可以发布的成品包。',
    tags: ['npm', '部署'],
    note: '部署前先 build 一次，能提前发现不少问题。',
    createdAt: now - 1 * 60 * 1000,
  },
]

const defaultLibraries = [
  { id: 'library-git', name: 'Git 小书架', tag: 'git', color: '#ffe1a1' },
  { id: 'library-npm', name: 'npm 命令盒', tag: 'npm', color: '#d9eef6' },
  { id: 'library-tools', name: '工具按钮', tag: '工具', color: '#f9e4d6' },
]

const libraryColors = [
  { name: '奶油黄', value: '#ffe1a1' },
  { name: '云朵蓝', value: '#d9eef6' },
  { name: '桃子粉', value: '#f9e4d6' },
  { name: '薄荷绿', value: '#dff0d8' },
  { name: '葡萄紫', value: '#eadff5' },
  { name: '杏仁橙', value: '#f7d6b8' },
]

const emptyTermCard = {
  type: 'term',
  title: '',
  explanation: '',
  stage: '',
  understanding: '',
  tagsText: '',
  note: '',
}

const emptyPitfallCard = {
  type: 'pitfall',
  question: '',
  reason: '',
  steps: '',
  tagsText: '',
}

function loadCards() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const parsed = stored ? JSON.parse(stored) : starterCards
    const starterMap = new Map(starterCards.map((card) => [card.id, card]))

    return parsed.map((card, index) => ({
      ...(starterMap.get(card.id) || card),
      createdAt: card.createdAt || now - (parsed.length - index) * 60 * 1000,
    }))
  } catch {
    return starterCards
  }
}

function loadLibraries() {
  try {
    const stored = localStorage.getItem(LIBRARY_KEY)
    const parsed = stored ? JSON.parse(stored) : defaultLibraries
    return parsed.map((library, index) => ({
      ...library,
      color: library.color || libraryColors[index % libraryColors.length].value,
    }))
  } catch {
    return defaultLibraries
  }
}

function normalizeTags(value) {
  return value
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function cardToForm(card) {
  if (card.type === 'term') {
    return {
      type: 'term',
      title: card.title || '',
      explanation: card.explanation || '',
      stage: card.stage || '',
      understanding: card.understanding || '',
      tagsText: (card.tags || []).join(' '),
      note: card.note || '',
    }
  }

  return {
    type: 'pitfall',
    question: card.question || '',
    reason: card.reason || '',
    steps: card.steps || '',
    tagsText: (card.tags || []).join(' '),
  }
}

function App() {
  const [cards, setCards] = useState(loadCards)
  const [libraries, setLibraries] = useState(loadLibraries)
  const [query, setQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('term')
  const [form, setForm] = useState(emptyTermCard)
  const [editingCardId, setEditingCardId] = useState(null)
  const [flipCard, setFlipCard] = useState(null)
  const [activeView, setActiveView] = useState('home')
  const [sortOrder, setSortOrder] = useState('desc')
  const [newLibraryName, setNewLibraryName] = useState('')
  const [newLibraryColor, setNewLibraryColor] = useState(libraryColors[0].value)
  const [selectedLibraryId, setSelectedLibraryId] = useState(null)
  const [libraryMode, setLibraryMode] = useState('grid')
  const [isDeletingLibraries, setIsDeletingLibraries] = useState(false)
  const [selectedLibraryIds, setSelectedLibraryIds] = useState([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
  }, [cards])

  useEffect(() => {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(libraries))
  }, [libraries])

  const filteredCards = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    const searchedCards = keyword
      ? cards.filter((card) => {
          const searchable = [
            card.title,
            card.explanation,
            card.question,
            ...(card.tags || []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return searchable.includes(keyword)
        })
      : cards

    return [...searchedCards].sort((a, b) =>
      sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt,
    )
  }, [cards, query, sortOrder])

  function openModal(type = 'term') {
    setEditingCardId(null)
    setActiveTab(type)
    setForm(type === 'term' ? emptyTermCard : emptyPitfallCard)
    setIsModalOpen(true)
  }

  function openEditModal(card) {
    setEditingCardId(card.id)
    setActiveTab(card.type)
    setForm(cardToForm(card))
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingCardId(null)
  }

  function switchTab(type) {
    if (editingCardId) return
    setActiveTab(type)
    setForm(type === 'term' ? emptyTermCard : emptyPitfallCard)
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function saveCard(event) {
    event.preventDefault()

    const cardPayload =
      activeTab === 'term'
        ? {
            type: 'term',
            title: form.title.trim(),
            explanation: form.explanation.trim(),
            stage: form.stage.trim(),
            understanding: form.understanding.trim(),
            tags: normalizeTags(form.tagsText),
            note: form.note.trim(),
          }
        : {
            type: 'pitfall',
            question: form.question.trim(),
            reason: form.reason.trim(),
            steps: form.steps.trim(),
            tags: normalizeTags(form.tagsText),
          }

    if (activeTab === 'term' && !cardPayload.title) return
    if (activeTab === 'pitfall' && !cardPayload.question) return

    if (editingCardId) {
      setCards((current) =>
        current.map((card) =>
          card.id === editingCardId
            ? {
                ...card,
                ...cardPayload,
              }
            : card,
        ),
      )
      setFlipCard((current) =>
        current?.id === editingCardId
          ? {
              ...current,
              ...cardPayload,
            }
          : current,
      )
    } else {
      setCards((current) => [
        {
          id: crypto.randomUUID(),
          ...cardPayload,
          createdAt: Date.now(),
        },
        ...current,
      ])
    }

    closeModal()
  }

  function deleteCard(id) {
    setCards((current) => current.filter((card) => card.id !== id))
    setFlipCard((current) => (current?.id === id ? null : current))
  }

  function pickRandomCard() {
    if (cards.length === 0) {
      setFlipCard(null)
      return
    }
    const nextIndex = Math.floor(Math.random() * cards.length)
    setFlipCard(cards[nextIndex])
  }

  function addLibrary(event) {
    event.preventDefault()
    const name = newLibraryName.trim()
    if (!name) return

    setLibraries((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name,
        tag: name,
        color: newLibraryColor,
      },
    ])
    setNewLibraryName('')
    setNewLibraryColor(libraryColors[0].value)
    setLibraryMode('grid')
  }

  function toggleLibrarySelection(id) {
    setSelectedLibraryIds((current) =>
      current.includes(id) ? current.filter((libraryId) => libraryId !== id) : [...current, id],
    )
  }

  function closeLibraryDeleteMode() {
    setIsDeletingLibraries(false)
    setSelectedLibraryIds([])
  }

  function confirmDeleteLibraries() {
    if (selectedLibraryIds.length === 0) return
    const ok = window.confirm(`确认删除选中的 ${selectedLibraryIds.length} 个词典吗？卡片本身会保留在卡片库里。`)
    if (!ok) return

    setLibraries((current) => current.filter((library) => !selectedLibraryIds.includes(library.id)))
    if (selectedLibraryIds.includes(selectedLibraryId)) {
      setSelectedLibraryId(null)
      setLibraryMode('grid')
    }
    closeLibraryDeleteMode()
  }

  return (
    <main className="app-shell">
      <Decorations />

      {activeView === 'home' && (
        <HomeView
          query={query}
          setQuery={setQuery}
          flipCard={flipCard}
          pickRandomCard={pickRandomCard}
          deleteCard={deleteCard}
          editCard={openEditModal}
        />
      )}

      {activeView === 'dictionary' && (
        <DictionaryView
          query={query}
          setQuery={setQuery}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          cards={filteredCards}
          deleteCard={deleteCard}
          editCard={openEditModal}
        />
      )}

      {activeView === 'library' && (
        <LibraryView
          cards={cards}
          libraries={libraries}
          newLibraryName={newLibraryName}
          setNewLibraryName={setNewLibraryName}
          newLibraryColor={newLibraryColor}
          setNewLibraryColor={setNewLibraryColor}
          addLibrary={addLibrary}
          deleteCard={deleteCard}
          editCard={openEditModal}
          selectedLibraryId={selectedLibraryId}
          setSelectedLibraryId={setSelectedLibraryId}
          libraryMode={libraryMode}
          setLibraryMode={setLibraryMode}
          isDeletingLibraries={isDeletingLibraries}
          setIsDeletingLibraries={setIsDeletingLibraries}
          selectedLibraryIds={selectedLibraryIds}
          toggleLibrarySelection={toggleLibrarySelection}
          closeLibraryDeleteMode={closeLibraryDeleteMode}
          confirmDeleteLibraries={confirmDeleteLibraries}
        />
      )}

      <button className="floating-add" type="button" onClick={() => openModal('term')} aria-label="新增卡片">
        +
      </button>

      <BottomNav activeView={activeView} setActiveView={setActiveView} />

      {isModalOpen && (
        <CardModal
          activeTab={activeTab}
          form={form}
          isEditing={Boolean(editingCardId)}
          switchTab={switchTab}
          updateField={updateField}
          saveCard={saveCard}
          closeModal={closeModal}
        />
      )}
    </main>
  )
}

function Decorations() {
  return (
    <>
      <div className="confetti confetti-one" />
      <div className="confetti confetti-two" />
      <div className="confetti confetti-three" />
      <div className="confetti confetti-four" />
    </>
  )
}

function HomeView({ query, setQuery, flipCard, pickRandomCard, deleteCard, editCard }) {
  return (
    <section className="home-panel" aria-labelledby="app-title">
      <img className="bear-image" src="/assets/top-bear.png" alt="" aria-hidden="true" />

      <header className="hero">
        <p className="soft-label">happy coding</p>
        <h1 id="app-title">满满代码翻译器</h1>
      </header>

      <div className="quick-actions">
        <label className="search-box">
          <span>搜索</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜词条、解释、问题或标签"
          />
        </label>

        <button className="flip-entry" type="button" onClick={pickRandomCard}>
          翻卡器
        </button>
      </div>

      {flipCard && (
        <section className="flip-zone" aria-live="polite">
          <Card card={flipCard} onDelete={deleteCard} onEdit={editCard} featured />
        </section>
      )}
    </section>
  )
}

function DictionaryView({ query, setQuery, sortOrder, setSortOrder, cards, deleteCard, editCard }) {
  return (
    <section className="page-panel" aria-labelledby="dictionary-title">
      <div className="page-heading dictionary-heading">
        <div>
          <p className="soft-label">card library</p>
          <h1 id="dictionary-title">卡片库</h1>
        </div>
        <button className="sort-toggle" type="button" onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}>
          {sortOrder === 'desc' ? '新到旧' : '旧到新'}
        </button>
      </div>

      <label className="search-box full-search">
        <span>搜索</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜词条、解释、问题或标签"
        />
      </label>

      <section className="card-list" aria-label="卡片库卡片">
        {cards.map((card) => (
          <Card key={card.id} card={card} onDelete={deleteCard} onEdit={editCard} />
        ))}
        {cards.length === 0 && <div className="empty-state">没有找到这张小卡，换个关键词试试。</div>}
      </section>
    </section>
  )
}

function LibraryView({
  cards,
  libraries,
  newLibraryName,
  setNewLibraryName,
  newLibraryColor,
  setNewLibraryColor,
  addLibrary,
  deleteCard,
  editCard,
  selectedLibraryId,
  setSelectedLibraryId,
  libraryMode,
  setLibraryMode,
  isDeletingLibraries,
  setIsDeletingLibraries,
  selectedLibraryIds,
  toggleLibrarySelection,
  closeLibraryDeleteMode,
  confirmDeleteLibraries,
}) {
  const selectedLibrary = libraries.find((library) => library.id === selectedLibraryId)
  const libraryCards = selectedLibrary
    ? cards.filter((card) => card.tags?.includes(selectedLibrary.tag))
    : []

  if (libraryMode === 'create') {
    return (
      <section className="page-panel" aria-labelledby="create-library-title">
        <div className="page-heading">
          <div>
          <p className="soft-label">new shelf</p>
            <h1 id="create-library-title">新建词典</h1>
          </div>
          <button className="sort-toggle" type="button" onClick={() => setLibraryMode('grid')}>
            返回
          </button>
        </div>

        <form className="library-form" onSubmit={addLibrary}>
          <label>
            <span>库名</span>
            <input
              value={newLibraryName}
              onChange={(event) => setNewLibraryName(event.target.value)}
              placeholder="比如：重要概念"
            />
          </label>

          <div className="form-block">
            <span>颜色</span>
            <div className="color-picker" aria-label="选择库颜色">
              {libraryColors.map((color) => (
                <button
                  key={color.value}
                  className={newLibraryColor === color.value ? 'active' : ''}
                  type="button"
                  style={{ '--swatch-color': color.value }}
                  onClick={() => setNewLibraryColor(color.value)}
                  aria-label={color.name}
                />
              ))}
            </div>
          </div>

          <button className="save-button" type="submit">
            保存词典
          </button>
        </form>
      </section>
    )
  }

  if (libraryMode === 'detail' && selectedLibrary) {
    return (
      <section className="page-panel" aria-labelledby="library-detail-title">
        <div className="page-heading">
          <div>
            <p className="soft-label">dictionary shelf</p>
            <h1 id="library-detail-title">{selectedLibrary.name}</h1>
          </div>
          <button className="sort-toggle" type="button" onClick={() => setLibraryMode('grid')}>
            返回
          </button>
        </div>

        <section className="card-list" aria-label={`${selectedLibrary.name}条目`}>
          {libraryCards.map((card) => (
            <Card key={card.id} card={card} onDelete={deleteCard} onEdit={editCard} />
          ))}
          {libraryCards.length === 0 && (
            <div className="empty-state">这个词典还空着。给卡片加上「{selectedLibrary.tag}」标签，它就会出现在这里。</div>
          )}
        </section>
      </section>
    )
  }

  return (
    <section className="page-panel" aria-labelledby="library-title">
      <div className="page-heading library-heading">
        <div>
          <p className="soft-label">dictionaries</p>
          <h1 id="library-title">词典</h1>
        </div>
        <div className="library-toolbar">
          {isDeletingLibraries ? (
            <>
              <button className="soft-action" type="button" onClick={closeLibraryDeleteMode}>
                取消
              </button>
              <button
                className="danger-action"
                type="button"
                onClick={confirmDeleteLibraries}
                disabled={selectedLibraryIds.length === 0}
              >
                删除{selectedLibraryIds.length > 0 ? ` ${selectedLibraryIds.length}` : ''}
              </button>
            </>
          ) : (
            <button className="sort-toggle" type="button" onClick={() => setIsDeletingLibraries(true)}>
              整理
            </button>
          )}
        </div>
      </div>

      <div className="shelf-grid">
        {libraries.map((library) => {
          const isSelected = selectedLibraryIds.includes(library.id)

          return (
            <button
              className={`shelf-card ${isDeletingLibraries ? 'selecting' : ''} ${isSelected ? 'selected' : ''}`}
              key={library.id}
              type="button"
              onClick={() => {
                if (isDeletingLibraries) {
                  toggleLibrarySelection(library.id)
                  return
                }
                setSelectedLibraryId(library.id)
                setLibraryMode('detail')
              }}
              aria-pressed={isDeletingLibraries ? isSelected : undefined}
            >
              {isDeletingLibraries && <span className="select-mark">{isSelected ? '✓' : ''}</span>}
              <div className="shelf-cover" style={{ '--library-color': library.color }}>
                <span>{library.name}</span>
              </div>
            </button>
          )
        })}

        {!isDeletingLibraries && (
          <button className="shelf-card add-shelf" type="button" onClick={() => setLibraryMode('create')}>
            <div className="plus-mark" aria-hidden="true">
              +
            </div>
            <span className="add-shelf-text">新建词典</span>
          </button>
        )}
      </div>
    </section>
  )
}

function BottomNav({ activeView, setActiveView }) {
  const items = [
    { id: 'home', label: '首页', icon: '⌂' },
    { id: 'library', label: '词典', icon: '◇' },
    { id: 'dictionary', label: '卡片库', icon: '▤' },
  ]

  return (
    <nav className="bottom-nav" aria-label="主导航">
      {items.map((item) => (
        <button
          key={item.id}
          className={activeView === item.id ? 'active' : ''}
          type="button"
          onClick={() => setActiveView(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

function CardModal({ activeTab, form, isEditing, switchTab, updateField, saveCard, closeModal }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={closeModal}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {isEditing ? (
          <div className="modal-tabs single-tab" aria-label="卡片类型">
            <span>{activeTab === 'term' ? '术语卡' : '踩坑卡'}</span>
          </div>
        ) : (
          <div className="modal-tabs" role="tablist" aria-label="卡片类型">
            <button className={activeTab === 'term' ? 'active' : ''} type="button" onClick={() => switchTab('term')}>
              术语卡
            </button>
            <button className={activeTab === 'pitfall' ? 'active' : ''} type="button" onClick={() => switchTab('pitfall')}>
              踩坑卡
            </button>
          </div>
        )}

        <div className="modal-heading">
          <h2 id="modal-title">{isEditing ? '编辑' : '新增'}{activeTab === 'term' ? '术语卡' : '踩坑卡'}</h2>
          <button type="button" className="ghost-close" onClick={closeModal}>
            关闭
          </button>
        </div>

        <form className="card-form" onSubmit={saveCard}>
          {activeTab === 'term' ? (
            <>
              <TextInput label="词条" value={form.title} onChange={(value) => updateField('title', value)} required />
              <TextArea label="解释" value={form.explanation} onChange={(value) => updateField('explanation', value)} />
              <TextInput label="使用阶段" value={form.stage} onChange={(value) => updateField('stage', value)} />
              <TextArea label="我的理解" value={form.understanding} onChange={(value) => updateField('understanding', value)} />
              <TextInput label="标签" value={form.tagsText} onChange={(value) => updateField('tagsText', value)} placeholder="用空格或逗号分隔" />
              <TextArea label="备注" value={form.note} onChange={(value) => updateField('note', value)} />
            </>
          ) : (
            <>
              <TextInput label="问题" value={form.question} onChange={(value) => updateField('question', value)} required />
              <TextArea label="可能原因" value={form.reason} onChange={(value) => updateField('reason', value)} />
              <TextArea label="解决步骤" value={form.steps} onChange={(value) => updateField('steps', value)} />
              <TextInput label="标签" value={form.tagsText} onChange={(value) => updateField('tagsText', value)} placeholder="用空格或逗号分隔" />
            </>
          )}

          <button className="save-button" type="submit">
            {isEditing ? '保存修改' : '保存小卡'}
          </button>
        </form>
      </section>
    </div>
  )
}

function TextInput({ label, value, onChange, placeholder, required = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} />
    </label>
  )
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} rows="3" />
    </label>
  )
}

function Card({ card, onDelete, onEdit, featured = false }) {
  const isTerm = card.type === 'term'

  return (
    <article className={`study-card ${featured ? 'featured-card' : ''}`}>
      <div className="card-topline">
        <span className="card-type">{isTerm ? '术语卡' : '踩坑卡'}</span>
        <div className="card-actions">
          <button type="button" onClick={() => onEdit(card)} aria-label="编辑卡片">
            编辑
          </button>
          <button type="button" onClick={() => onDelete(card.id)} aria-label="删除卡片">
            删除
          </button>
        </div>
      </div>

      <h2>{isTerm ? card.title : card.question}</h2>

      {isTerm ? (
        <>
          <p>{card.explanation}</p>
          {card.stage && <InfoRow label="阶段" value={card.stage} />}
          {card.understanding && <InfoRow label="我的理解" value={card.understanding} />}
          {card.note && <InfoRow label="备注" value={card.note} />}
        </>
      ) : (
        <>
          {card.reason && <InfoRow label="可能原因" value={card.reason} />}
          {card.steps && <InfoRow label="解决步骤" value={card.steps} />}
        </>
      )}

      {card.tags?.length > 0 && (
        <div className="tags">
          {card.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
    </article>
  )
}

function InfoRow({ label, value }) {
  return (
    <p className="info-row">
      <strong>{label}</strong>
      {value}
    </p>
  )
}

export default App
