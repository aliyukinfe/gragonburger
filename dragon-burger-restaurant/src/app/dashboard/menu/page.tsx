'use client'
import { useEffect, useState } from 'react'
import { MenuItems } from '@/types'
import { DEFAULT_MENU } from '@/lib/menu-data'
import { formatPrice } from '@/lib/utils'

export default function MenuEditorPage() {
  const [menu, setMenu] = useState<MenuItems>(DEFAULT_MENU)
  const [activeCategory, setActiveCategory] = useState(Object.keys(DEFAULT_MENU)[0])
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [editingItem, setEditingItem] = useState<{ idx: number; name: string; price: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/menu')
      const data = await res.json()
      if (data.data) { setMenu(data.data); setActiveCategory(Object.keys(data.data)[0]) }
    }
    load()
  }, [])

  const saveMenu = async (newMenu: MenuItems) => {
    setSaving(true)
    await fetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: newMenu }) })
    setSaving(false)
    setSavedMsg('✅ Menu saved!')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  const addCategory = () => {
    if (!newCatName.trim()) return
    const updated = { ...menu, [newCatName.trim()]: [] }
    setMenu(updated)
    setActiveCategory(newCatName.trim())
    setNewCatName('')
    saveMenu(updated)
  }

  const deleteCategory = (cat: string) => {
    if (!confirm(`Delete category "${cat}" and all its items?`)) return
    const updated = { ...menu }
    delete updated[cat]
    setMenu(updated)
    setActiveCategory(Object.keys(updated)[0] || '')
    saveMenu(updated)
  }

  const addItem = () => {
    if (!newItemName.trim() || !newItemPrice) return
    const updated = { ...menu, [activeCategory]: [...(menu[activeCategory] || []), { name: newItemName.trim(), price: Number(newItemPrice) }] }
    setMenu(updated)
    setNewItemName('')
    setNewItemPrice('')
    saveMenu(updated)
  }

  const deleteItem = (idx: number) => {
    const updated = { ...menu, [activeCategory]: menu[activeCategory].filter((_, i) => i !== idx) }
    setMenu(updated)
    saveMenu(updated)
  }

  const saveEditItem = () => {
    if (!editingItem) return
    const updated = { ...menu, [activeCategory]: menu[activeCategory].map((item, i) => i === editingItem.idx ? { name: editingItem.name, price: Number(editingItem.price) } : item) }
    setMenu(updated)
    setEditingItem(null)
    saveMenu(updated)
  }

  const resetMenu = async () => {
    if (!confirm('Reset to default Dragon Burger menu? All changes will be lost!')) return
    setMenu(DEFAULT_MENU)
    setActiveCategory(Object.keys(DEFAULT_MENU)[0])
    saveMenu(DEFAULT_MENU)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontFamily: 'Bebas Neue, cursive', fontSize: '28px', color: 'var(--green-dark)', letterSpacing: '2px' }}>
          🏷️ Menu Editor
        </h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {savedMsg && <span style={{ color: 'var(--green)', fontWeight: 700 }}>{savedMsg}</span>}
          {saving && <span style={{ color: 'var(--text-muted)' }}>💾 Saving...</span>}
          <button className="btn btn-danger btn-sm" onClick={resetMenu}>🔄 Reset to Default</button>
        </div>
      </div>

      <div className="two-col">
        {/* CATEGORIES */}
        <div>
          <div className="card" style={{ marginBottom: '14px' }}>
            <div className="card-header"><span className="card-title">📂 Categories</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {Object.keys(menu).map(cat => (
                <div key={cat} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                    style={{ flex: 1, textAlign: 'left', borderRadius: '8px', padding: '8px 12px' }}
                  >
                    {cat} <span style={{ fontSize: '11px', opacity: 0.7 }}>({(menu[cat] || []).length} items)</span>
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(cat)}>🗑️</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="form-control" placeholder="New category name" value={newCatName} onChange={e => setNewCatName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategory()} />
              <button className="btn btn-primary" onClick={addCategory}>➕</button>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🍔 Items in "{activeCategory}"</span>
          </div>

          {/* Add new item */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input className="form-control" placeholder="Item name" value={newItemName} onChange={e => setNewItemName(e.target.value)} style={{ flex: 2, minWidth: '150px' }} />
            <input className="form-control" type="number" placeholder="Price (PKR)" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} style={{ flex: 1, minWidth: '100px' }} />
            <button className="btn btn-primary" onClick={addItem}>➕ Add Item</button>
          </div>

          {(menu[activeCategory] || []).length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}><div className="empty-icon">🍽️</div><h3>No items yet</h3></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>#</th><th>Item Name</th><th>Price</th><th>Actions</th></tr></thead>
                <tbody>
                  {(menu[activeCategory] || []).map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{idx+1}</td>
                      <td>
                        {editingItem?.idx === idx ? (
                          <input className="form-control" value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} />
                        ) : (
                          <span style={{ fontWeight: 600 }}>{item.name}</span>
                        )}
                      </td>
                      <td>
                        {editingItem?.idx === idx ? (
                          <input className="form-control" type="number" value={editingItem.price} onChange={e => setEditingItem({ ...editingItem, price: e.target.value })} style={{ width: '100px' }} />
                        ) : (
                          <span style={{ fontWeight: 700, color: 'var(--green-dark)' }}>{formatPrice(item.price)}</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {editingItem?.idx === idx ? (
                            <>
                              <button className="btn btn-primary btn-sm" onClick={saveEditItem}>💾</button>
                              <button className="btn btn-secondary btn-sm" onClick={() => setEditingItem(null)}>✕</button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-secondary btn-sm" onClick={() => setEditingItem({ idx, name: item.name, price: String(item.price) })}>✏️</button>
                              <button className="btn btn-danger btn-sm" onClick={() => deleteItem(idx)}>🗑️</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
