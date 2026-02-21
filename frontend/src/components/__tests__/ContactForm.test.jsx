import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactForm from '../ContactForm';

describe('ContactForm', () => {
  it('affiche le formulaire avec les champs', () => {
    render(<ContactForm onSubmit={() => {}} />);
    expect(screen.getByPlaceholderText('Dupont')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Jean')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('06 12 34 56 78')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('jean.dupont@email.com')).toBeInTheDocument();
  });

  it('affiche le bouton Ajouter en mode création', () => {
    render(<ContactForm onSubmit={() => {}} />);
    expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument();
  });

  it('appelle onSubmit avec les données du formulaire', async () => {
    const onSubmit = vi.fn();
    render(<ContactForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'Martin' } });
    fireEvent.change(screen.getByPlaceholderText('Jean'), { target: { value: 'Pierre' } });
    fireEvent.change(screen.getByPlaceholderText('06 12 34 56 78'), { target: { value: '0611223344' } });
    fireEvent.change(screen.getByPlaceholderText('jean.dupont@email.com'), { target: { value: 'pierre@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      nom: 'Martin',
      prenom: 'Pierre',
      telephone: '0611223344',
      email: 'pierre@test.com'
    });
  });

  it('affiche le formulaire en mode édition avec bouton Annuler', () => {
    const contact = { _id: '1', nom: 'Dupont', prenom: 'Jean', telephone: '06', email: 'j@t.fr' };
    const onCancel = vi.fn();
    render(<ContactForm onSubmit={() => {}} contact={contact} onCancel={onCancel} />);

    expect(screen.getByText('Modifier le contact')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mettre à jour' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Dupont')).toBeInTheDocument();
  });

  it('appelle onCancel quand on clique Annuler', () => {
    const contact = { _id: '1', nom: 'Dupont', prenom: 'Jean', telephone: '06', email: 'j@t.fr' };
    const onCancel = vi.fn();
    render(<ContactForm onSubmit={() => {}} contact={contact} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('appelle onSubmit en mode édition', () => {
    const contact = { _id: '1', nom: 'Dupont', prenom: 'Jean', telephone: '06', email: 'j@t.fr' };
    const onSubmit = vi.fn();
    render(<ContactForm onSubmit={onSubmit} contact={contact} onCancel={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('Dupont'), { target: { value: 'Martin' } });
    fireEvent.click(screen.getByRole('button', { name: 'Mettre à jour' }));

    expect(onSubmit).toHaveBeenCalledWith({
      _id: '1',
      nom: 'Martin',
      prenom: 'Jean',
      telephone: '06',
      email: 'j@t.fr'
    });
  });
});
