import { useState, useEffect } from 'react'
import ContactList from './components/ContactList'
import ContactForm from './components/ContactForm'
import './App.css'

const API_URL = '/api/contacts'

function App() {
  const [contacts, setContacts] = useState([])
  const [editingContact, setEditingContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('Erreur chargement')
      const data = await res.json()
      setContacts(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const handleCreate = async (contact) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      })
      if (!res.ok) throw new Error('Erreur création')
      await fetchContacts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdate = async (id, contact) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      })
      if (!res.ok) throw new Error('Erreur mise à jour')
      setEditingContact(null)
      await fetchContacts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce contact ?')) return
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur suppression')
      await fetchContacts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📞 Répertoire Téléphonique</h1>
        <p>Gérez vos contacts</p>
      </header>

      <main className="main">
        <ContactForm
          onSubmit={editingContact ? (c) => handleUpdate(editingContact._id, c) : handleCreate}
          contact={editingContact}
          onCancel={() => setEditingContact(null)}
        />

        <section className="contacts-section">
          <h2>Liste des contacts</h2>
          {error && <p className="error">⚠️ {error}</p>}
          {loading ? (
            <p className="loading">Chargement...</p>
          ) : (
            <ContactList
              contacts={contacts}
              onEdit={setEditingContact}
              onDelete={handleDelete}
            />
          )}
        </section>
      </main>
    </div>
  )
}

export default App
