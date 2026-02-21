import './ContactList.css'

function ContactList({ contacts, onEdit, onDelete }) {
  if (contacts.length === 0) {
    return <p className="empty">Aucun contact. Ajoutez-en un !</p>
  }

  return (
    <div className="contact-list">
      {contacts.map((contact) => (
        <article key={contact._id} className="contact-card">
          <div className="contact-info">
            <h3>{contact.prenom} {contact.nom}</h3>
            <p>📞 {contact.telephone}</p>
            <p>✉️ {contact.email}</p>
          </div>
          <div className="contact-actions">
            <button className="btn-edit" onClick={() => onEdit(contact)}>
              Modifier
            </button>
            <button className="btn-delete" onClick={() => onDelete(contact._id)}>
              Supprimer
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default ContactList
