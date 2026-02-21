import { useState, useEffect } from 'react'
import './ContactForm.css'

const initialForm = { nom: '', prenom: '', telephone: '', email: '' }

function ContactForm({ onSubmit, contact, onCancel }) {
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    setForm(contact ? { ...contact } : initialForm)
  }, [contact])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nom || !form.prenom || !form.telephone || !form.email) return
    onSubmit(form)
    setForm(initialForm)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h2>{contact ? 'Modifier le contact' : 'Nouveau contact'}</h2>
      <div className="form-grid">
        <div>
          <label>Nom</label>
          <input
            name="nom"
            value={form.nom}
            onChange={handleChange}
            placeholder="Dupont"
            required
          />
        </div>
        <div>
          <label>Prénom</label>
          <input
            name="prenom"
            value={form.prenom}
            onChange={handleChange}
            placeholder="Jean"
            required
          />
        </div>
        <div>
          <label>Téléphone</label>
          <input
            name="telephone"
            type="tel"
            value={form.telephone}
            onChange={handleChange}
            placeholder="06 12 34 56 78"
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jean.dupont@email.com"
            required
          />
        </div>
      </div>
      <div className="form-actions">
        {contact && (
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Annuler
          </button>
        )}
        <button type="submit" className="btn-primary">
          {contact ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}

export default ContactForm
