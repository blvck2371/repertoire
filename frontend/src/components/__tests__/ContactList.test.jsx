import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactList from '../ContactList';

describe('ContactList', () => {
  it('affiche un message quand la liste est vide', () => {
    render(<ContactList contacts={[]} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/aucun contact/i)).toBeInTheDocument();
  });

  it('affiche les contacts', () => {
    const contacts = [
      { _id: '1', nom: 'Dupont', prenom: 'Jean', telephone: '0612345678', email: 'jean@test.com' }
    ];
    render(<ContactList contacts={contacts} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText(/0612345678/)).toBeInTheDocument();
    expect(screen.getByText(/jean@test.com/)).toBeInTheDocument();
  });

  it('affiche les boutons Modifier et Supprimer', () => {
    const contacts = [
      { _id: '1', nom: 'Dupont', prenom: 'Jean', telephone: '0612345678', email: 'jean@test.com' }
    ];
    render(<ContactList contacts={contacts} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByRole('button', { name: /modifier/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument();
  });
});
